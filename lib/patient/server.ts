import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { patientConfig, portalOrigin } from "./config";
import type { Application } from "./schema";

export async function patientClient() {
  // Keep the configuration gate and session check at request time even when
  // the production build was made before the development backend was connected.
  await connection();
  const config = patientConfig();
  if (!config) redirect("/portal");
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: new URL(portalOrigin()).protocol === "https:", path: "/" },
    global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
    cookies: {
      getAll: () => store.getAll(),
      setAll: values => {
        // Proxy refreshes sessions before rendering. Actions/handlers can write.
        try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component cookie writes are not permitted. */ }
      },
    },
  });
}

export async function requirePatient() {
  const client = await patientClient();
  // Validate with the provider, never trust getSession() or client metadata.
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/portal/login");
  return { client, user };
}

const columns = "id,status,version,contact_name,phone,city,support_types,request_summary,created_at,updated_at,submitted_at";

export async function patientApplications() {
  const { client, user } = await requirePatient();
  const { data, error } = await client.from("patient_applications").select(columns).eq("patient_id", user.id).order("created_at", { ascending: false });
  if (error) return null;
  return data as Application[];
}

export async function patientApplication(id: string) {
  const { client, user } = await requirePatient();
  const { data, error } = await client.from("patient_applications").select(columns).eq("patient_id", user.id).eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load this application. Please try again.");
  return data as Application | null;
}
