// tests/login.page.spec.js
const { test, expect } = require("../fixtures/kameleo.fixture");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const { sleepMs, randomDelay } = require("../utility/utility");
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

test("should validate user login workflow successfully", async ({ page }) => {
  // Validate data before starting
  validatePassengerData(PASSENGER_DATA);

  // Navigate to IRCTC
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.VERY_LONG, TIMEOUTS.EXTEND));

  // Handle initial dialog
  await page.keyboard.press("Enter");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  // Login
  await performLogin(page);

  // Search train
  await searchTrain(page, PASSENGER_DATA);

  // Book train
  await pickTrain(page, PASSENGER_DATA.TRAIN_NO, PASSENGER_DATA.TRAIN_COACH);

  // Fill passenger details
  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);
  await page.locator("text=Consider for Auto Upgradation").click();

  // Handle payment
  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await handleUPIPayment(page, PASSENGER_DATA.UPI_ID_CONFIG);
  } else {
    await handleWalletPayment(page);
  }
});
