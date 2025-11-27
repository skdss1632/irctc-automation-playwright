const { test, expect } = require("../fixtures/kameleo.fixture");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const ENV = require("../playwright.env.json");
const { sleepMs, randomDelay } = require("../utility/delay");
const {
  hoverAndClick,
  handlePassengerInput,
  fillInputText,
  handleTicketType,
  pickTrain,
} = require("../utility/utility");
const { TIMEOUTS } = require("../enums/enums");

test("should validate user login workflow successfully", async ({ page }) => {
  // ✅ Navigation and setup
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.VERY_LONG, TIMEOUTS.EXTEND));

  // Handle initial dialog
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

  // ✅ Login flow
  await page.locator("text=LOGIN").first().click();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "User Name", ENV.IRCTC_USERNAME, "placeholder");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "password", ENV.IRCTC_PASSWORD, "placeholder");
  await page.keyboard.press("Tab");

  // ✅ Search train
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter From station')]",
    PASSENGER_DATA.SOURCE_STATION
  );
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter To station')]",
    PASSENGER_DATA.DESTINATION_STATION
  );
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await fillInputText(page, "#jDate", PASSENGER_DATA.TRAVEL_DATE);
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await handleTicketType(page);
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // ✅ Book train
  await pickTrain(page, PASSENGER_DATA.TRAIN_NO, PASSENGER_DATA.TRAIN_COACH);

  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);

  await page.locator("text=Consider for Auto Upgradation").click();

  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await page.locator("text=Pay through BHIM/UPI").click();
  }

  await page.locator(".train_Search.btnDefault").click();

  if (PASSENGER_DATA.UPI_ID_CONFIG === "") {
    await page.getByAltText("Rail Icon").click();
  }

  await page.locator("text=Pay & Book").nth(2).click();
});
