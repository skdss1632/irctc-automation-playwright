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
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

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
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // ✅ Book train
  await pickTrain(page, PASSENGER_DATA.TRAIN_NO, PASSENGER_DATA.TRAIN_COACH);

  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);
  await page.locator("text=Consider for Auto Upgradation").click();

  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await page.locator("text=Pay through BHIM/UPI").click();
    // pay n book btn
    await page.locator(".train_Search.btnDefault").click();
    // radio btn selection
   await page.locator('input[type="radio"][value="upiMandate"]').check();
    // upi id input fld
    const widget = page.locator("#upiMandate_wrapper");
    // click the input field inside the widget
    const upiInput = widget.locator("#mndtVpa");
    await upiInput.click();
    // type the UPI ID
    await upiInput.pressSequentially(PASSENGER_DATA.UPI_ID_CONFIG);
    // click auto-debit button
    await page.locator("#autoDebitBtn").click();

  } else{
    // for wallet selection
    await page.getByAltText("Text= (Instant Payment)").click();
    // pay n book btn
    await page.locator(".train_Search.btnDefault").click();
    // confirm btn using wallet pay -- do not uncomment the below line as of now
    // await page.locator(".mob-bot-btn.search_btn").click();
  }

});
