/** Development intake is deliberately separate from opening real applications. */
export function patientConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (process.env.PATIENT_PORTAL_MODE !== "development" || !url || !key || !isPublishableKey(key)) return null;
  try {
    portalOrigin();
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}

/** Reject privileged keys; the provider still verifies the actual key. */
export function isPublishableKey(key: string) {
  if (key.startsWith("sb_publishable_")) return key.length > "sb_publishable_".length;
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return false;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")).role === "anon";
  } catch {
    return false;
  }
}

export function portalOrigin() {
  const value = process.env.PATIENT_PORTAL_SITE_URL;
  if (!value) throw new Error("Patient portal site URL is not configured");
  const url = new URL(value);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) throw new Error("Portal requires HTTPS");
  return url.origin;
}
