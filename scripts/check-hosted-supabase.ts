import { patientConfig } from "../lib/patient/config";

async function check() {
  const config = patientConfig();
  if (!config) throw new Error("Hosted development configuration is incomplete or disabled. Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, PATIENT_PORTAL_SITE_URL, and PATIENT_PORTAL_MODE=development in environment settings. Never use a service-role key.");
  if (new URL(config.url).protocol !== "https:") throw new Error("This check requires an HTTPS hosted development project. Use the separate local command for Docker development.");
  const headers = { apikey: config.key };
  async function request(path: string) {
    try {
      return await fetch(`${config!.url}${path}`, { headers, redirect: "error", signal: AbortSignal.timeout(15_000) });
    } catch {
      throw new Error("Could not reach the hosted project. Check that the exact project hostname is allowed, the project is running, and proxy/CA settings are active. No credentials were printed.");
    }
  }
  const settings = await request("/auth/v1/settings");
  if (!settings.ok) throw new Error("The authentication endpoint rejected this configuration. Check the project URL and publishable key in environment settings.");
  let auth: { mailer_autoconfirm?: boolean; disable_signup?: boolean };
  try { auth = await settings.json(); }
  catch { throw new Error("Authentication settings returned an invalid response. No response body was printed."); }
  if (!auth || typeof auth !== "object") throw new Error("Authentication settings returned an invalid response.");
  if (auth.mailer_autoconfirm === true) throw new Error("Enable email confirmation for the hosted development project before patient account testing.");
  if (auth.disable_signup === true) throw new Error("Email sign-up is disabled. Configure the development project's email sign-up policy before testing registration.");
  console.log("Hosted authentication endpoint is reachable with the configured publishable key.");
  for (const table of ["patient_profiles", "patient_applications", "patient_application_events"]) {
    const response = await request(`/rest/v1/${table}?select=*&limit=0`);
    if (response.status === 404) throw new Error("Patient tables are not available. Apply the tracked migration to the empty development project and retry after its API schema refreshes.");
    if (![401, 403].includes(response.status)) throw new Error("Anonymous patient-table protection did not return the expected denial. Review the migration and grants before enabling account testing.");
    const denial = await response.json().catch(() => null);
    if (denial?.code !== "42501") throw new Error("The table request failed, but database permission denial could not be confirmed. Check project connectivity and database grants before continuing.");
  }
  console.log("Anonymous patient-table requests were denied. No records were read or written.");
  console.log("Read-only preflight passed. This does not verify authenticated ownership, email delivery, recovery, or the full patient workflow; those checks remain required.");
}

check().catch(error => { console.error(error instanceof Error ? error.message : "Hosted preflight failed. No credentials were printed."); process.exitCode = 1; });
