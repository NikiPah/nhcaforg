import { expect, test } from "@playwright/test";

test("an unconfigured portal exposes no credential collection forms", async ({ page }) => {
  for (const path of ["/portal/login", "/portal/register", "/portal/reset-password"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Patient accounts are not available yet");
    await expect(page.locator("form, input, textarea")).toHaveCount(0);
  }
});

test("unconfigured protected routes return to information without exposing a record", async ({ page }) => {
  for (const path of ["/portal/dashboard", "/portal/update-password", "/portal/applications/11111111-1111-4111-8111-111111111111"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your future place to manage assistance");
  }
});

test("confirmation callback cannot act as an open redirect", async ({ request }) => {
  const response = await request.get("/portal/auth/callback?next=https://evil.example.com", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  const location = new URL(response.headers().location);
  expect(location.hostname).toBe("127.0.0.1");
  expect(location.pathname).toBe("/portal");
});
