/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS browser runner. */
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

async function main() {
  const origin = process.env.PORTAL_TEST_ORIGIN || "http://127.0.0.1:3001";
  const csrf = await fetch(`${origin}/api/assistance-inquiries`, { method: "POST", headers: { Origin: "https://unrelated.example", "Content-Type": "application/json" }, body: "{}" });
  assert.equal(csrf.status, 403);
  const invalid = await fetch(`${origin}/api/assistance-inquiries`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ inquiry_id: crypto.randomUUID(), website: "" }) });
  assert.equal(invalid.status, 400);
  assert.match(invalid.headers.get("cache-control"), /no-store/);
  assert.equal((await fetch(`${origin}/api/assistance-inquiries`)).status, 405);
  assert.equal((await fetch(`${origin}/api/portal`)).status, 410);
  for (const path of ["/portal", "/portal/demo", "/portal/auth/callback"]) assert.equal(new URL((await fetch(origin + path)).url).pathname, "/apply");
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium", args: ["--no-sandbox"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin);
    assert.equal(await page.locator('a[href="#apply"]').count(), 0);
    const headerApply = page.getByRole("banner").getByRole("link", { name: /^Apply for Assistance/ });
    assert.equal(await headerApply.getAttribute("href"), "/apply");
    assert.equal(await headerApply.getAttribute("target"), "_blank");
    const [formPage] = await Promise.all([page.waitForEvent("popup"), headerApply.click()]);
    formPage.setDefaultTimeout(15000);
    await formPage.getByRole("heading", { name: "Apply for Assistance", exact: true }).waitFor();
    assert.equal(new URL(page.url()).pathname, "/");
    assert.equal(new URL(formPage.url()).pathname, "/apply");
    assert.equal(await formPage.evaluate(() => window.opener), null);
    assert.equal(await formPage.getByRole("button", { name: /sign in|log in/i }).count(), 0);
    assert.equal(await formPage.locator('input[type="file"]').count(), 0);
    await formPage.getByText("300% of the Federal Poverty Guidelines", { exact: true }).waitFor();
    const sent = [];
    let rejectFirst = true;
    await formPage.route("**/api/assistance-inquiries", async (route) => {
      const payload = route.request().postDataJSON(); sent.push(payload);
      if (rejectFirst) { rejectFirst = false; return route.fulfill({ status: 503, json: { error: "Test service unavailable. Please try again." } }); }
      await route.fulfill({ status: 201, json: { reference: `NHCAF-${payload.inquiry_id.replaceAll("-", "").toUpperCase()}` } });
    });
    await formPage.getByRole("checkbox", { name: "Food assistance", exact: true }).check();
    await formPage.getByLabel("Your name", { exact: false }).fill("Alex Example");
    await formPage.getByLabel("Phone number", { exact: false }).fill("555-010-2345");
    await formPage.getByLabel("County", { exact: false }).fill("Harris");
    await formPage.getByLabel("ZIP code", { exact: false }).fill("77373");
    await formPage.getByRole("combobox", { name: "Has the patient received a cancer diagnosis?", exact: false }).selectOption("Yes");
    await formPage.getByLabel("Number of people in the household", { exact: false }).fill("2");
    await formPage.getByRole("checkbox", { name: "I need help estimating household income.", exact: true }).check();
    assert.equal(await formPage.locator('input[name="income_amount"]').count(), 0);
    await formPage.getByRole("checkbox", { name: "I need help estimating household income.", exact: true }).uncheck();
    await formPage.getByLabel("Household income before taxes", { exact: false }).fill("0");
    await formPage.getByRole("combobox", { name: "Can you provide proof of income?", exact: false }).selectOption("I need help obtaining this");
    await formPage.getByRole("combobox", { name: "Can you provide proof of cancer diagnosis?", exact: false }).selectOption("I can provide this");
    await formPage.getByRole("checkbox", { name: /I confirm that I am the patient/ }).check();
    assert.equal(sent.length, 0);
    await formPage.getByRole("button", { name: "Send assistance inquiry", exact: false }).click();
    await formPage.getByRole("alert").filter({ hasText: "Test service unavailable" }).waitFor();
    assert.equal(await formPage.getByLabel("Your name", { exact: false }).inputValue(), "Alex Example");
    assert.equal(await formPage.getByRole("heading", { name: "We received your assistance inquiry." }).count(), 0);
    for (const width of [1440, 1024, 390, 320]) {
      await formPage.setViewportSize({ width, height: 900 });
      assert.equal(await formPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Form fits ${width}px`);
    }
    await formPage.setViewportSize({ width: 1280, height: 1000 });
    await formPage.screenshot({ path: "/tmp/nhcaf-assistance-inquiry-desktop.png", fullPage: true });
    await formPage.getByRole("button", { name: "Send assistance inquiry", exact: false }).click();
    await formPage.getByRole("heading", { name: "We received your assistance inquiry." }).waitFor();
    assert.equal(sent.length, 2);
    assert.equal(sent[0].inquiry_id, sent[1].inquiry_id);
    assert.equal(sent[1].income_amount, 0);
    assert.equal(sent[1].patient_name, "Alex Example");
    assert.equal(await formPage.evaluate(() => document.activeElement.id), "receipt-heading");
    assert.deepEqual(await formPage.evaluate(() => Object.keys(localStorage)), []);
    assert.deepEqual(await formPage.context().cookies(), []);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    const [mobilePage] = await Promise.all([page.waitForEvent("popup"), page.getByRole("navigation", { name: "Primary mobile", exact: true }).getByRole("link", { name: /^Apply for Assistance/ }).click()]);
    await mobilePage.getByRole("heading", { name: "Apply for Assistance", exact: true }).waitFor();
    await mobilePage.getByRole("combobox", { name: "I am applying as", exact: false }).selectOption("Family member or caregiver");
    await mobilePage.getByLabel("Patient’s name", { exact: false }).waitFor();
    await mobilePage.getByRole("combobox", { name: "Preferred contact method", exact: false }).selectOption("Email");
    assert.equal(await mobilePage.locator('input[name="email"]').getAttribute("required"), "");
    assert.equal(await mobilePage.locator('input[name="phone"]').getAttribute("required"), null);
    await mobilePage.screenshot({ path: "/tmp/nhcaf-assistance-inquiry-mobile.png", fullPage: true });
    assert.deepEqual(errors, []);
    console.log("PASS: separate page/window on desktop and mobile; no login/uploads; inquiry validation, no typing transmission, failure/retry, confirmation, responsive layout, caregiver and contact choices. Live Supabase not exercised.");
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
