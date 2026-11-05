import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { patientConfig, portalOrigin } from "@/lib/patient/config";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = patientConfig();
  if (config) {
    const client = createServerClient(config.url, config.key, {
      cookieOptions: { httpOnly: true, sameSite: "lax", secure: new URL(portalOrigin()).protocol === "https:", path: "/" },
      global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: values => {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await client.auth.getUser();
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: ["/portal/:path*"] };
