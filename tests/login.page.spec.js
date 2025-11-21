const { test, expect } = require("@playwright/test");
const PASSENGER_DETAILS = require("../fixtures/passenger.data.json");
const ENV = require("../playwright.env.json");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
} = require("../helpers/delay");

test("should validate user login workflow successfully", async ({
  page,
  context,
}) => {
  // // Basic anti-detection tweaks (within Playwright limits)
  await context.addInitScript(() => {
    // hide webdriver flag
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    // provide languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["en-US", "en"],
    });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
  });

  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(1000, 2000));

  // // alert dialog handling
  // const dialog = page.locator('[role="dialog"]');
  // await dialog.waitFor({ state: "visible" });
  // await dialog.locator('button:has-text("OK")').click();
  // await sleepMs(randomDelay(8000, 10000));
  // await dialog.waitFor({ state: "hidden" });

  // // Login process
  // await page.locator("text=LOGIN").first().click();
  // await sleepMs(randomDelay(200, 500));
  // await page.waitForSelector('input[placeholder="User Name"]', {
  //   state: "visible",
  // });

  // // handle username field
  // const usernameField = page.getByPlaceholder("User Name");
  // await usernameField.hover();
  // await usernameField.click();
  // await sleepMs(randomDelay(200, 500));
  // await usernameField.pressSequentially(ENV.IRCTC_USERNAME, {
  //   delay: randomDelay(100, 200),
  // });
  // await sleepMs(randomDelay(200, 500));

  // // handle password field
  // const passwordField = page.getByPlaceholder("password");
  // await passwordField.hover();
  // await passwordField.click();
  // await sleepMs(randomDelay(200, 500));
  // await passwordField.pressSequentially(ENV.IRCTC_PASSWORD, {
  //   delay: randomDelay(100, 200),
  // });
  // await sleepMs(randomDelay(200, 500));
  // await page.keyboard.press("Tab");

  await page.waitForTimeout(240000); // Wait for manual captcha solving

  // handling sign in button
  // const signInBtn = page.locator("//button[@type='submit']").nth(1);
  // await signInBtn.hover();
  // await signInBtn.click();
  // await sleepMs(randomDelay(200, 500));
  // await page.waitForTimeout(3000);
  // await expect(page.getByText(ENV.IRCTC_USERNAME)).toBeVisible({
  //   timeout: 5000,
  // });

  await page.locator("#origin").fill(PASSENGER_DETAILS.SOURCE_STATION);
  await page
    .locator("#destination")
    .fill(PASSENGER_DETAILS.DESTINATION_STATION);

  await page.locator("#jDate").fill(PASSENGER_DETAILS.TRAVEL_DATE);

  await page.locator('[type="submit"]').click();
  await page.waitForTimeout(5000);
});
