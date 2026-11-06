import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { hostedTestConfig } from "../lib/patient/hosted-test-config";

const configured = hostedTestConfig(process.env);
if (!configured.ok) throw new Error(configured.message);
const accounts = configured.accounts;

async function signIn(page: Page, index: 0 | 1) {
  try {
    await page.goto("/portal/login");
    await page.getByLabel("Email address").fill(accounts[index].email);
    await page.getByLabel("Password", { exact: true }).fill(accounts[index].password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL("**/portal/dashboard", { timeout: 20_000 });
  } catch {
    // Do not forward locator fill errors, which can include credential values.
    throw new Error("Development patient sign-in failed. Check account confirmation, environment configuration, and provider availability.");
  } finally {
    await page.evaluate(() => document.querySelectorAll<HTMLInputElement>('input[name="password"], input[name="email"]').forEach(input => { input.value = ""; })).catch(() => {});
  }
}

test("confirmed patient can sign in, save, resume, and submit a fictional application", async ({ page }) => {
  await page.goto("/portal/login?confirmation=failed");
  await expect(page.getByRole("alert")).toContainText("We could not confirm that email link");
  await signIn(page, 0);
  await expect(page.getByRole("heading", { name: "My applications" })).toBeVisible();
  await page.getByRole("button", { name: "Start a test application" }).click();
  await expect(page).toHaveURL(/\/portal\/applications\/[a-f0-9-]+$/);
  const draftUrl = page.url();
  const name = `Fictional Patient ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("Fictional contact name *").fill(name);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Your draft has been saved");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/portal\/login$/);
  await page.goto(draftUrl);
  await expect(page).toHaveURL(/\/portal\/login$/);
  await signIn(page, 0);
  await page.goto(draftUrl);
  await expect(page.getByLabel("Fictional contact name *")).toHaveValue(name);
  await page.getByRole("button", { name: "Submit test application" }).click();
  await expect(page.getByRole("alert")).toContainText("Complete the required test fields");
  await expect(page.getByLabel("Fictional contact name *")).toHaveValue(name);
  await page.getByLabel("Fictional city *").fill("Fictional City");
  await page.getByLabel("Fictional phone number", { exact: false }).fill("202-555-0100");
  await page.getByLabel("Food assistance", { exact: true }).check();
  await page.getByLabel("Fictional support summary (optional)").fill("Fictional development request only.");
  await page.getByRole("button", { name: "Submit test application" }).click();
  await expect(page.getByRole("alert")).toContainText("Confirm that you are submitting fictional test information only");
  await page.getByLabel("I confirm these are fictional test details", { exact: false }).check();
  await page.getByRole("button", { name: "Submit test application" }).click();
  await expect(page.getByRole("heading", { name: "Test submission recorded" })).toBeVisible();
  for (const text of [name, "Fictional City", "202-555-0100", "Fictional development request only."]) await expect(page.getByText(text, { exact: true })).toBeVisible();
  await expect(page.locator('input[name="contact_name"], textarea')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your test submission" })).toBeVisible();
  const cookies = (await page.context().cookies()).filter(cookie => cookie.name.includes("auth-token"));
  expect(cookies.length > 0 && cookies.every(cookie => cookie.httpOnly && cookie.sameSite === "Lax")).toBe(true);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("another confirmed patient cannot open the owner's exact application URL", async ({ page, browser }) => {
  await signIn(page, 0);
  await page.getByRole("button", { name: "Start a test application" }).click();
  await expect(page).toHaveURL(/\/portal\/applications\/[a-f0-9-]+$/);
  const ownerUrl = page.url();
  const otherContext = await browser.newContext();
  try {
    const other = await otherContext.newPage();
    await signIn(other, 1);
    await other.goto(ownerUrl);
    await expect(other.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(other.locator('input[name="contact_name"]')).toHaveCount(0);
  } finally { await otherContext.close(); }
});
