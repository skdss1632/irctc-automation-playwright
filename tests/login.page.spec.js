const { test, expect } = require("@playwright/test");

test("should validate user login workflow successfully", async ({ page }) => {
  await page.goto("https://www.irctc.co.in/nget/train-search");

  await page.locator(".ui-overflow-hidden").click();
  await page.waitForTimeout(5000);

  await page.getByText("Login").click();

  // await page.fill("#username", "");
  // await page.fill("#password", "");

// await expect(page.getByText("Welcome")).toBeVisible();

});
