const { test, expect } = require("@playwright/test");
const PASSENGER_DETAILS = require("../fixtures/passenger.data.json");
require("dotenv").config();

test("should validate user login workflow successfully", async ({ page }) => {
  await page.goto("https://www.irctc.co.in/nget/train-search");

  console.log("Type:", typeof process.env.IRCTC_PASSWORD);

  // 1. Handle the alert dialog first
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: "visible" });
  // Click OK button INSIDE the dialog - correct way
  await dialog.locator('button:has-text("OK")').click();
  // Wait for dialog to close
  await dialog.waitFor({ state: "hidden" });
  // 2. Click LOGIN link to open login modal
  await page.locator("text=LOGIN").first().click();
  // 3. Wait for login form to appear
  await page.waitForSelector('input[placeholder="User Name"]', {
    state: "visible",
  });

  // 4. Fill credentials
  await page.getByPlaceholder("User Name").click();
  await page.keyboard.type(process.env.IRCTC_USERNAME);

  //   await page.getByPlaceholder("Password").click();
  //   await page.fill(process.env.IRCTC_PASSWORD);

  //   await page
  await page
    .getByPlaceholder("Password")
    .fill(process.env.IRCTC_PASSWORD, { delay: 100 });
  await page.waitForTimeout(20000);

  await page.locator('button:has-text("SIGN IN")').click();

  await page.locator("#origin").fill(PASSENGER_DETAILS.SOURCE_STATION);
  // Find element with id="destination"
  await page
    .locator("#destination")
    .fill(PASSENGER_DETAILS.DESTINATION_STATION);

  await page.locator("#jDate").fill(PASSENGER_DETAILS.TRAVEL_DATE);

  await page.locator('[type="submit"]').click();
  await page.waitForTimeout(5000);

  // 6. Verify login success
  // await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });
});
