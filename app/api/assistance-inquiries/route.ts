import { createClient } from "@supabase/supabase-js";
import { body, failure, json, sameOrigin } from "@/lib/portal/server";
import { PortalError } from "@/lib/portal/validation";
import { InquiryError, validateInquiry } from "@/lib/assistance/inquiry";

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const input = await body(request);
    if (input.website !== "") throw new PortalError("The inquiry could not be submitted. Please use the form on this website.", 400);
    if (typeof input.inquiry_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.inquiry_id)) throw new PortalError("Please reload the inquiry form and try again.", 400);
    const details = validateInquiry(input);
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new PortalError("Online inquiries are temporarily unavailable. Please contact NHCAF using the contact link below.", 503);
    // No login or service-role key. A restricted database function can only submit an inquiry and return its reference.
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(20000) }) } });
    const { data, error } = await client.rpc("nhcaf_submit_assistance_inquiry", { p_id: input.inquiry_id, p_details: details });
    if (error) {
      if (error.code === "P0001") throw new PortalError("Several inquiries have been received for these contact details. Please contact NHCAF before sending another.", 429);
      throw new PortalError("Your inquiry could not be confirmed. Your answers are still here. Please try again, or contact NHCAF below.", 503);
    }
    if (typeof data !== "string" || !/^NHCAF-[0-9A-F]{32}$/.test(data)) throw new PortalError("We could not confirm receipt. Please try again using this form.", 503);
    return json({ reference: data }, 201);
  } catch (error) {
    if (error instanceof InquiryError) return json({ error: error.message }, 400);
    return failure(error);
  }
}
