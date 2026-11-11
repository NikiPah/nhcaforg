import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PortalError } from "./validation";

export function portalOrigin(request: Request) {
  const configured = process.env.PORTAL_ORIGIN;
  if (!configured && process.env.NODE_ENV === "production") throw new PortalError("The portal site URL has not been configured.", 503);
  if (configured) return new URL(configured).origin;
  // Next's development request URL can use localhost even when the browser uses 127.0.0.1.
  // Trust the incoming Host only for loopback development, never for a production redirect/origin.
  const actual = new URL(request.url);
  const host = request.headers.get("host");
  if (host) {
    const incoming = new URL(`${actual.protocol}//${host}`);
    if (["localhost", "127.0.0.1", "[::1]"].includes(incoming.hostname)) return incoming.origin;
  }
  return actual.origin;
}
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== portalOrigin(request)) throw new PortalError("Please use the form on this website.", 403);
}
export async function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new PortalError("The patient portal connection has not been configured.", 503);
  const store = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(20000) }) },
    cookies: { getAll: () => store.getAll(), setAll: (items) => { for (const { name, value, options } of items) store.set(name, value, options); } },
  });
}
export async function authenticated() {
  const client = await supabase();
  const { data, error } = await client.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError" && error.status !== 401 && error.status !== 403) throw new PortalError("Unable to verify your session. Please try again.", 503);
  if (!data.user?.email_confirmed_at) throw new PortalError("Please sign in to your patient account.", 401);
  return { client, user: data.user };
}
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie", "X-Content-Type-Options": "nosniff" } }); }
export function failure(error: unknown) { return json({ error: error instanceof PortalError ? error.message : "The portal could not complete this request. Please try again." }, error instanceof PortalError ? error.status : 503); }
async function limitedBytes(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError("Missing form data.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > limit) { await reader.cancel(); throw new PortalError("The request is too large.", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
export async function multipart(request: Request, limit: number) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new PortalError("Choose a document to upload.");
  const bytes = await limitedBytes(request, limit);
  try { return await new Response(bytes, { headers: { "Content-Type": request.headers.get("content-type")! } }).formData(); } catch { throw new PortalError("The file request could not be read."); }
}
export async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new PortalError("Expected a form request.");
  const raw = new TextDecoder().decode(await limitedBytes(request, 12000));
  try { const value = JSON.parse(raw); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); return value as Record<string, unknown>; } catch { throw new PortalError("Please check the form and try again."); }
}
