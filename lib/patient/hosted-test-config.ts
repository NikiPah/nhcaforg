import { z } from "zod";
import { isPublishableKey } from "./config";

type Environment = Record<string, string | undefined>;
type TestAccount = { email: string; password: string };
type Result = { ok: false; message: string } | { ok: true; projectOrigin: string; accounts: [TestAccount, TestAccount] };

/** Explicitly target an isolated development project; no generated hosted users. */
export function hostedTestConfig(env: Environment): Result {
  const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "PATIENT_TEST_TARGET_URL", "PATIENT_TEST_EMAIL_A", "PATIENT_TEST_PASSWORD_A", "PATIENT_TEST_EMAIL_B", "PATIENT_TEST_PASSWORD_B"];
  const missing = required.filter(name => !env[name]);
  if (missing.length) return { ok: false, message: `Hosted tests require environment settings: ${missing.join(", ")}. Enter values securely, never in chat.` };
  if (env.PATIENT_PORTAL_MODE !== "development") return { ok: false, message: "Hosted tests require PATIENT_PORTAL_MODE=development." };
  let project: URL;
  let target: URL;
  try { project = new URL(env.SUPABASE_URL!); target = new URL(env.PATIENT_TEST_TARGET_URL!); }
  catch { return { ok: false, message: "Hosted test project URLs must be valid HTTPS origins." }; }
  if ([project, target].some(url => url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) || project.origin !== target.origin) {
    return { ok: false, message: "PATIENT_TEST_TARGET_URL must exactly identify the configured HTTPS development project origin." };
  }
  if (!isPublishableKey(env.SUPABASE_PUBLISHABLE_KEY!)) return { ok: false, message: "Hosted tests require a publishable/anon key, never a privileged key." };
  const schema = z.object({ email: z.email().max(254), password: z.string().min(12).max(128) });
  const a = schema.safeParse({ email: env.PATIENT_TEST_EMAIL_A, password: env.PATIENT_TEST_PASSWORD_A });
  const b = schema.safeParse({ email: env.PATIENT_TEST_EMAIL_B, password: env.PATIENT_TEST_PASSWORD_B });
  if (!a.success || !b.success) return { ok: false, message: "Provide two confirmed development test accounts with valid emails and passwords of 12–128 characters." };
  if (a.data.email.toLowerCase() === b.data.email.toLowerCase()) return { ok: false, message: "Hosted ownership tests require two different patient accounts." };
  return { ok: true, projectOrigin: project.origin, accounts: [a.data, b.data] };
}
