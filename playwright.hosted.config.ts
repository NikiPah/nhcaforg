import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
import { hostedTestConfig } from "./lib/patient/hosted-test-config";

const configured = hostedTestConfig(process.env);
if (!configured.ok) throw new Error(configured.message);
process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";

export default defineConfig(base, {
  testMatch: "**/patient-hosted.spec.ts",
  testIgnore: [],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: { trace: "off", screenshot: "off", video: "off" },
});
