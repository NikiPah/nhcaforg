/** Development intake is deliberately separate from opening real applications. */
export function patientConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (process.env.PATIENT_PORTAL_MODE !== "development" || !url || !key) return null;
  try {
    portalOrigin();
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

export function portalOrigin() {
  const value = process.env.PATIENT_PORTAL_SITE_URL;
  if (!value) throw new Error("Patient portal site URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Portal requires HTTPS");
  return url.origin;
}
