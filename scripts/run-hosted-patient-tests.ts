import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { hostedTestConfig } from "../lib/patient/hosted-test-config";

const configured = hostedTestConfig(process.env);
if (!configured.ok) { console.error(configured.message); process.exit(1); }
const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...process.env,
  NODE_USE_ENV_PROXY: "1",
  PATIENT_PORTAL_SITE_URL: "http://127.0.0.1:3100",
  // Disable failure DOM snapshots in addition to traces/video/screenshots.
  PLAYWRIGHT_NO_COPY_PROMPT: "1",
};
const preflight = spawnSync(process.execPath, ["--use-env-proxy", "--import", "tsx", "scripts/check-hosted-supabase.ts"], { cwd: root, env, stdio: "inherit" });
if (preflight.status !== 0) process.exit(preflight.status ?? 1);
const tests = spawnSync(process.execPath, ["node_modules/@playwright/test/cli.js", "test", "--config=playwright.hosted.config.ts"], { cwd: root, env, stdio: "inherit" });
process.exit(tests.status ?? 1);
