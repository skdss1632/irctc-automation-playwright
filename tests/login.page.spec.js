const { test, expect } = require("../fixtures/kameleo.fixture");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const {
  sleepMs,
  randomDelay,
  waitUntilTatkalBookingTime,
  verifyElementByText,
} = require("../utility/utility");
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

test("automated ticket booking", async ({ page }) => {
  // Validate data before starting
  validatePassengerData(PASSENGER_DATA);

  const BASE_URL = "https://www.irctc.co.in/nget/train-search";
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // Handle initial dialog
  await page.keyboard.press("Enter");


  // Login
  await verifyElementByText({page:page, text:"IRCTC EXCLUSIVE"});
  await performLogin(page);

  // Search train
  await searchTrain(page, PASSENGER_DATA);
  waitUntilTatkalBookingTime();

  // pick train
  //  await verifyElementByText(page, "View Cancellation Policy"); // captcha page so no need to verify this now
  await verifyElementByText({page:page, text:"Show Available Trains"});
  await pickTrain(page, PASSENGER_DATA.TRAIN_NO, PASSENGER_DATA.TRAIN_COACH);

  // Fill passenger details -- timeout is 5 min bcz if user login before the tatkal time i.e 3 or 5 min before..
  await verifyElementByText({page:page, text:"+ Add Passenger", timeout:300000});
  await handlePassengerInput(page, PASSENGER_DATA.PASSENGER_DETAILS);

  // Handle payment
  await verifyElementByText({page:page, text:"Safe & Secure Payments"});
  if (PASSENGER_DATA.UPI_ID_CONFIG) {
    await handleUPIPayment(page, PASSENGER_DATA.UPI_ID_CONFIG);
  } else {
    await handleWalletPayment(page);
  }
    await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.VERY_LONG));
    console.log("ticket booked successfully")
});
