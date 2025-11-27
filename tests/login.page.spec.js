// const { test, expect } = require("@playwright/test");
const { test, expect } = require("../fixtures/kameleo.fixture");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const ENV = require("../playwright.env.json");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
  scrollIntoView,
} = require("../utility/delay");
const {
  hoverAndClick,
  handlePassengerInput,
  fillInputText,
  handleTicketType,
  pickTrain,
} = require("../utility/utility");
const {TIMEOUTS} = require("../enums/enums");

test("should validate user login workflow successfully", async ({
  kameleoContext,
}) => {
  // Create a new page from the Kameleo context
  const page = await kameleoContext.newPage();
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.VERY_LONG, TIMEOUTS.EXTEND));
  page.once("dialog", async (dialog) => {
    await dialog.dismiss();
  });

  // // alert dialog handling
  await page.keyboard.press("Enter");

  // Login process
  await page.locator("text=LOGIN").first().click();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // // handle username field
  await fillInputText(
    page,
    "User Name",
    ENV.IRCTC_USERNAME,
    "placeholder"
  );
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // // handle password field
  await fillInputText(
    page,
    "password",
    ENV.IRCTC_PASSWORD,
    "placeholder"
  );
  // switch to captcha fld
  await page.keyboard.press("Tab");

  // handling source station
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter From station')]",
    PASSENGER_DATA.SOURCE_STATION,
  );
   await sleepMs(
     randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
   );
  await page.keyboard.press("Enter");

  // handling destignation station
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter To station')]",
    PASSENGER_DATA.DESTINATION_STATION,
  );
    await sleepMs(
      randomDelay(
        TIMEOUTS.MIN_TRAIN_SEARCH_WAIT,
        TIMEOUTS.MAX_TRAIN_SEARCH_WAIT
      )
    );
  await page.keyboard.press("Enter");

  // handling travel date
  await fillInputText(
    page,
    "#jDate",
    PASSENGER_DATA.TRAVEL_DATE,
  );
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await handleTicketType(page);
    await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // handling search btn
  // await hoverAndClick(page, ".search_btn.train_Search >> nth=0");

  // handling train selection
  await pickTrain(
    page,
    PASSENGER_DATA.TRAIN_NO,
    PASSENGER_DATA.TRAIN_COACH,
  );

  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);
  await page.locator("text=Consider for Auto Upgradation ").click();
  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await hoverAndClick(page, "text= Pay through BHIM/UPI ", "placeholder");
  }
  await page.locator(".train_Search.btnDefault").click();
  if (PASSENGER_DATA.UPI_ID_CONFIG === "") {
    // selecting wallet
    await page.getByAltText("Rail Icon").click();
  }
  await page.locator("Pay & Book ").nth(2).click();

  //Rail Icon
});
