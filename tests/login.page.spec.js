// const { test, expect } = require("../fixtures/kameleo.fixture");
const { test, expect } = require("@playwright/test");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const {
  sleepMs,
  randomDelay,
  waitUntilTatkalBookingTime,
  verifyElementByText,
  hoverAndClick,
  fillInputText,
} = require("../utility/utility");
const { checkOCRServer, solveCaptcha } = require("../utility/ocr-utility");
const { TIMEOUTS } = require("../enums/enums");

// Import IRCTC-specific helpers
const {
  validatePassengerData,
  performLogin,
  searchTrain,
  pickTrain,
  handlePassengerInput,
  handleUPIPayment,
  handleWalletPayment,
} = require("../helpers/helpers");

test.beforeAll(async () => {
  validatePassengerData(PASSENGER_DATA);
  // Check if OCR server is running before tests
  const isRunning = await checkOCRServer();
  if (!isRunning) {
    console.warn("\n⚠️  WARNING: OCR server is not running!");
    console.warn(
      "either Start it with: python ocr_server.py\n or solve captcha manually"
    );
  }
});

test("automated ticket booking", async ({ page }) => {
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // Handle initial dialog
  await page.keyboard.press("Enter");

  // Login
  await verifyElementByText({ page: page, text: "IRCTC EXCLUSIVE" });
  await performLogin(page, "Captcha Image here");

  // Search train
  await searchTrain(page, PASSENGER_DATA);
  // waitUntilTatkalBookingTime();

  // pick train
  await verifyElementByText({ page: page, text: "Show Available Trains" });
  await pickTrain(page, PASSENGER_DATA.TRAIN_NO, PASSENGER_DATA.TRAIN_COACH);

  // Fill passenger details -- timeout is 5 min bcz if user login before the tatkal time i.e 3 or 5 min before..
  await verifyElementByText({
    page: page,
    text: "+ Add Passenger",
    timeout: 300000,
  });
  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);

  // review journey
  await verifyElementByText({ page: page, text: "View Cancellation Policy" });
  if (ENV.AUTO_CAPTCHA) {
    const captchaText = await solveCaptcha(page, "Captcha Image here");
    fillInputText(page, "Enter Captcha", captchaText, "placeholder");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  }

  // Handle payment
  await verifyElementByText({ page: page, text: "Safe & Secure Payments" });
  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await handleUPIPayment(page, PASSENGER_DATA.UPI_ID_CONFIG);
  } else {
    await handleWalletPayment(page);
  }
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.VERY_LONG));
  console.log("ticket booked successfully");
});
