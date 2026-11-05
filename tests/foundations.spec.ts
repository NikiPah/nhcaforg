import { expect, test } from "@playwright/test";

test("homepage assistance navigation reaches the informational application page", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Helping individuals and families affected by cancer");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Primary mobile" })).toBeVisible();
    await page.getByRole("navigation", { name: "Primary mobile" }).getByRole("link", { name: "Apply for Assistance" }).click();
  } else {
    await page.getByRole("main").getByRole("link", { name: "Apply for Assistance", exact: true }).click();
  }
  await expect(page).toHaveURL(/\/apply$/);
  await expect(page.getByRole("heading", { name: "Online applications are not open yet" })).toBeVisible();
});

for (const [route, title] of [
  ["/apply", "A path to support, in development"],
  ["/portal", "Your future place to manage assistance"],
  ["/staff", "Staff access is not available"],
] as const) {
  test(`${route} is informational and accepts no sensitive information`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByRole("main")).toContainText(/not operational/i);
    await expect(page.getByRole("main")).toContainText(/do not (send|submit) personal, financial, or medical information/i);
    await expect(page.locator("form, input, textarea, select, [contenteditable=true], main iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).isVisible().then(async visible => {
      if (visible) {
        await page.getByRole("button", { name: "Open menu" }).click();
        await page.getByRole("button", { name: "Close menu" }).click();
      }
    });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`${route.slice(1)}.png`), fullPage: true });
  });
}

test("application and patient information link to one another", async ({ page }) => {
  await page.goto("/apply");
  await page.getByRole("link", { name: "Patient portal information" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await page.getByRole("link", { name: "Read about the planned application" }).click();
  await expect(page).toHaveURL(/\/apply$/);
});

test("portal and staff pages discourage indexing without exposing nested tools", async ({ page, request }) => {
  for (const route of ["/portal", "/staff"]) {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*nofollow/);
  }
  for (const route of ["/staff/applications", "/portal/applications", "/api/applications"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
  }
  const sitemap = await request.get("/sitemap.xml");
  const xml = await sitemap.text();
  expect(xml).toContain("https://www.nhcafoundation.org/apply");
  expect(xml).not.toContain("/staff");
  expect(xml).not.toContain("/portal");
});

test("donation page keeps the Zeffy fallback and independent donation link", async ({ page }) => {
  // Deterministically test failure recovery without contacting the payment service.
  await page.route("https://www.zeffy.com/**", route => route.abort());
  await page.goto("/donate");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Support Cancer Patients Beyond Treatment");
  await expect(page.getByRole("link", { name: "Donate securely through Zeffy" })).toHaveAttribute("href", "https://www.zeffy.com/en-US/donation-form/support-cancer-patients-through-nhcaf");
  await expect(page.locator('iframe[title="Donation form powered by Zeffy"]')).toHaveAttribute("src", "https://www.zeffy.com/embed/donation-form/support-cancer-patients-through-nhcaf");
});
