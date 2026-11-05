import { connection, NextResponse } from "next/server";
import { patientClient } from "@/lib/patient/server";
import { patientConfig, portalOrigin } from "@/lib/patient/config";

export async function GET(request: Request) {
  await connection();
  // A relative redirect preserves the browser origin even when Next.js
  // normalizes the internal request URL behind a proxy.
  if (!patientConfig()) return new Response(null, { status: 307, headers: { Location: "/portal" } });
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const client = await patientClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = url.searchParams.get("next") === "password" ? "/portal/update-password" : "/portal/dashboard";
      return NextResponse.redirect(new URL(target, portalOrigin()));
    }
  }
  return NextResponse.redirect(new URL("/portal/login?confirmation=failed", portalOrigin()));
}
