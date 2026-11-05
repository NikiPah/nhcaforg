import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

async function register(page: Page) {
  const email = `patient-${randomUUID()}@example.test`;
  const password = `Test-${randomUUID()}`;
  await page.goto("/portal/register");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create test account" }).click();
  await expect(page).toHaveURL(/\/portal\/dashboard$/);
  return { email, password };
}

test("unauthenticated visitors cannot open patient records", async ({ page }) => {
  await page.goto("/portal/dashboard");
  await expect(page).toHaveURL(/\/portal\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.goto("/portal/applications/11111111-1111-4111-8111-111111111111");
  await expect(page).toHaveURL(/\/portal\/login$/);
});

test("patient can save, sign out, resume, validate and submit a test application", async ({ page }, testInfo) => {
  const credentials = await register(page);
  await expect(page.getByText("You have no applications yet.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Start a test application" }).click();
  await expect(page.getByRole("heading", { name: "Your test application" })).toBeVisible();
  const appUrl = page.url();
  await page.getByLabel("Fictional contact name *").fill("Fictional Patient");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your draft has been saved");
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByLabel("Email address").fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("link", { name: "Continue application" }).click();
  await expect(page.getByLabel("Fictional contact name *")).toHaveValue("Fictional Patient");
  await page.getByRole("button", { name: "Submit test application" }).click();
  await expect(page.getByRole("alert")).toContainText("Complete the required test fields");
  await expect(page.getByLabel("Fictional contact name *")).toHaveValue("Fictional Patient");
  await page.getByLabel("Fictional city *").fill("Test City");
  await page.getByLabel("Food assistance", { exact: true }).check();
  await page.getByLabel("I confirm these are fictional test details", { exact: false }).check();
  await page.screenshot({ path: testInfo.outputPath("patient-draft.png"), fullPage: true });
  await page.getByRole("button", { name: "Submit test application" }).click();
  await expect(page.getByRole("heading", { name: "Test submission recorded" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save draft" })).toHaveCount(0);
  await page.goto(appUrl);
  await expect(page.getByRole("heading", { name: "Your test submission" })).toBeVisible();
  const cookies = await page.context().cookies();
  const authCookies = cookies.filter(c => c.name.includes("auth-token"));
  expect(authCookies.length).toBeGreaterThan(0);
  expect(authCookies.every(c => c.httpOnly && c.sameSite === "Lax")).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath("patient-submitted.png"), fullPage: true });
});

test("a second patient cannot open another patient's exact application URL", async ({ page, browser }) => {
  await register(page);
  await page.getByRole("button", { name: "Start a test application" }).click();
  await expect(page).toHaveURL(/\/portal\/applications\/[a-f0-9-]+$/);
  const aliceUrl = page.url();
  const bobContext = await browser.newContext();
  try {
    const bob = await bobContext.newPage();
    await register(bob);
    await expect(bob.getByText("You have no applications yet.", { exact: false })).toBeVisible();
    await bob.goto(aliceUrl);
    await expect(bob.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(bob.locator('input[name="contact_name"]')).toHaveCount(0);
  } finally { await bobContext.close(); }
});
