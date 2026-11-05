import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Capture status internally; never print the CLI's credentials or key values.
const cli = process.env.SUPABASE_CLI_PATH || "supabase";
const cwd = fileURLToPath(new URL("../", import.meta.url));
let status;
try { status = JSON.parse(execFileSync(cli, ["status", "-o", "json"], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })); }
catch { console.error("Local Supabase is not ready. Start it first; see docs/PATIENT_PORTAL.md. No credentials were printed."); process.exit(1); }
const url = status.API_URL;
if (!url || !["127.0.0.1", "localhost"].includes(new URL(url).hostname) || !status.ANON_KEY) {
  throw new Error("Refusing to run patient integration tests against a non-local or incomplete backend.");
}
const env = { ...process.env, PATIENT_PORTAL_MODE: "development", PATIENT_PORTAL_SITE_URL: "http://127.0.0.1:3100", SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: status.ANON_KEY };
const result = spawnSync(process.execPath, [fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url)), "test", "--config=playwright.patient.config.ts"], { cwd, env, stdio: "inherit" });
process.exit(result.status ?? 1);
