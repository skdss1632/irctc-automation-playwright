// const { test, expect } = require("@playwright/test");
const { test, expect } = require("../fixtures/kameleo.fixture");
const PASSENGER_DETAILS = require("../fixtures/passenger.data.json");
const ENV = require("../playwright.env.json");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
} = require("../helpers/delay");
const hoverAndClick = require("../helpers/utility");

test("should validate user login workflow successfully", async ({
  kameleoContext,
}) => {
  // Create a new page from the Kameleo context
  const page = await kameleoContext.newPage();
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(1000, 2000));

  // // alert dialog handling
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(8000, 10000));

  // // Login process
  await page.locator("text=LOGIN").first().click();
  await sleepMs(randomDelay(300, 500));
  await page.waitForSelector('input[placeholder="User Name"]', {
    state: "visible",
  });

  // // handle username field
  const usernameField = page.getByPlaceholder("User Name");
  hoverAndClick(page, "User Name");
  await sleepMs(randomDelay(200, 500));
  await usernameField.pressSequentially(ENV.IRCTC_USERNAME, {
    delay: randomDelay(100, 200),
  });
  await sleepMs(randomDelay(200, 500));

  // // handle password field
  const passwordField = page.getByPlaceholder("password");
  hoverAndClick(page, "password");
  await sleepMs(randomDelay(200, 500));
  await passwordField.pressSequentially(ENV.IRCTC_PASSWORD, {
    delay: randomDelay(100, 200),
  });
  await sleepMs(randomDelay(200, 500));
  await page.keyboard.press("Tab");

  await page.waitForTimeout(10000); // Wait for manual captcha solving

  // handling sign in button
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(300, 500));
  await page.waitForTimeout(3000);
  await expect(page.getByText(ENV.IRCTC_USERNAME)).toBeVisible({
    timeout: 10000,
  });

  // handling source station
  const sourceStation = page.locator(
    "//input[contains(@aria-label, 'Enter From station')]"
  );
  hoverAndClick(page, "//input[contains(@aria-label, 'Enter From station')]");
  await sourceStation.pressSequentially(PASSENGER_DETAILS.SOURCE_STATION);
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(1500, 2000));

  // handling destignation station
  await page.keyboard.press("Enter");
    await sleepMs(randomDelay(200, 500));
    await page.keyboard.press("Enter");
  await sleepMs(randomDelay(1500, 2000));
  await sourceStation.pressSequentially(PASSENGER_DETAILS.DESTINATION_STATION);
  await sleepMs(randomDelay(1500, 2000));
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(1500, 2000));

  // handling travel date
  hoverAndClick(page, "#jDate");
  await page.locator("#jDate").pressSequentially(PASSENGER_DETAILS.TRAVEL_DATE);
  await sleepMs(randomDelay(400, 600));
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(1500, 2000));
  await sleepMs(randomDelay(1500, 2000));
  
  // handling search btn
  hoverAndClick(page, '[type="submit"]');
  await page.waitForTimeout(5000);
});
