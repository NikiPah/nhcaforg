import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

const backend = process.env.SUPABASE_URL;
if (process.env.PATIENT_PORTAL_MODE !== "development" || !backend || !["localhost", "127.0.0.1"].includes(new URL(backend).hostname)) {
  throw new Error("Live patient tests require the local Supabase development backend. Use npm run test:patient:local.");
}

export default defineConfig(base, {
  testMatch: "**/patient-live.spec.ts",
  testIgnore: [],
  workers: 1,
  timeout: 60_000,
});
