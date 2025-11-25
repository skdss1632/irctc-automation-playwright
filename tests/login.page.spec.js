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
  scrollIntoView,
} = require("../helpers/delay");
const {
  hoverAndClick,
  handlePassengerInput,
  fillInputText,
  handleTicketType,
} = require("../helpers/utility");
const {TIMEOUTS} = require("../enums/enums");

test("should validate user login workflow successfully", async ({
  kameleoContext,
}) => {
  // Create a new page from the Kameleo context
  const page = await kameleoContext.newPage();
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.VERY_LONG, TIMEOUTS.EXTEND));

  // // alert dialog handling
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.VERY_LONG, TIMEOUTS.EXTEND));

  // // Login process
  await page.locator("text=LOGIN").first().click();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.waitForSelector('input[placeholder="User Name"]', {
    state: "visible",
  });

  // // handle username field
  await fillInputText(
    page,
    "User Name",
    ENV.IRCTC_USERNAME,
    TIMEOUTS.VERY_SHORT,
    TIMEOUTS.SHORT
  );
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // // handle password field
  await fillInputText(
    page,
    "password",
    ENV.IRCTC_PASSWORD,
    TIMEOUTS.VERY_SHORT,
    TIMEOUTS.SHORT
  );

  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.keyboard.press("Tab");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // await expect(page.getByText(ENV.IRCTC_USERNAME)).toBeVisible({
  //   timeout: TIMEOUTS.EXTEND,
  // });

  // handling source station
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter From station')]",
    PASSENGER_DETAILS.SOURCE_STATION,
    TIMEOUTS.VERY_SHORT,
    TIMEOUTS.SHORT
  );
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // handling destignation station
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter To station')]",
    PASSENGER_DETAILS.DESTINATION_STATION,
    TIMEOUTS.VERY_SHORT,
    TIMEOUTS.SHORT
  );
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  await handleTicketType(page);

  // handling travel date
  await fillInputText(
    page,
    "#jDate",
    PASSENGER_DETAILS.TRAVEL_DATE,
    TIMEOUTS.VERY_SHORT,
    TIMEOUTS.SHORT
  );
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // handling search btn
  await hoverAndClick(page, ".search_btn.train_Search >> nth=0");
  await page.waitForTimeout(5000);

  // handling train selection
  await page.locator(PASSENGER_DETAILS.TRAIN_NO).click();
  // SECTING THE COACH TYPE
  await page.locator(PASSENGER_DETAILS.TRAIN_COACH).click();
  await page.locator("text= Book Now ").first().click();
  const DAY = PASSENGER_DETAILS.TRAVEL_DATE.split("/")[0];
  await page.locator(`text=${DAY}`).click();

  await handlePassengerInput(page);
  await page.locator("text=Consider for Auto Upgradation ").click();
  if (PASSENGER_DETAILS.UPI_ID_CONFIG){
      await hoverAndClick(page, "text= Pay through BHIM/UPI ");
  }
  await page.locator("text=Continue ").click();
  if (PASSENGER_DETAILS.UPI_ID_CONFIG === ""){
    // selecting wallet
    await page.getByAltText("Rail Icon").click();
  }
  await page.locator("Pay & Book ").nth(2).click();

  //Rail Icon
});
