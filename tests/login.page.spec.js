// tests/login.page.spec.js

const { test, expect } = require("@playwright/test");
const { getPassengerData } = require("../utility/fetchPassengerData");
const ENV = require("../irctc.env.json");
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
const { saveSession, loadSession } = require("../utility/session-utility");

// Import IRCTC-specific helpers
const {
  validatePassengerData,
  performLogin,
  searchTrain,
  pickTrain,
  handlePassengerInput,
  handleUPIPayment,
  handleWalletPayment,
} = require("../utility/helpers");

test.beforeAll(async () => {
  const GET_PASSENGER_DATA = await getPassengerData();
  validatePassengerData(GET_PASSENGER_DATA);

  // Check if OCR server is running before tests
  const isRunning = await checkOCRServer();
  if (!isRunning) {
    console.warn("\n⚠️  WARNING: OCR server is not running!");
    console.warn(
      "Start it with: python ocr_server.py or solve captcha manually\n"
    );
  }
});

test("automated ticket booking", async ({ page, context }) => {
  const BASE_URL = "https://www.irctc.co.in/nget/train-search";

  // ✅ Fixed: Try to load existing session first
  const sessionLoaded = await loadSession(context);

  if (sessionLoaded) {
    console.log("✅ Using existing session - skipping login");

    // Go to page with existing session
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

    // Skip login if session is valid
  } else {
    console.log("ℹ️ No valid session - performing fresh login");

    // ✅ Clear cookies only if no session was loaded
    await context.clearCookies();

    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

    // Handle initial dialog
    await page.keyboard.press("Enter");
    await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

    // Login
    await verifyElementByText({ page: page, text: "IRCTC EXCLUSIVE" });
    await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

    await performLogin(page, "Captcha Image here");
    await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

    // ✅ Save session after successful login
    await saveSession(context);
    console.log("✅ Session saved for future use");
  }

  // Search train
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));
  await searchTrain(page, GET_PASSENGER_DATA);
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // Optional: Wait for Tatkal time
  // await waitUntilTatkalBookingTime(10, 0, 0);

  // Pick train
  console.log("🚂 Picking train...");
  await verifyElementByText({ page: page, text: "Show Available Trains" });
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

  await pickTrain(page, GET_PASSENGER_DATA.TRAIN_NO, GET_PASSENGER_DATA.TRAIN_COACH);
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // Fill passenger details
  console.log("👥 Filling passenger details...");
  await verifyElementByText({
    page: page,
    text: "+ Add Passenger",
    timeout: 300000,
  });
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

  await handlePassengerInput(page, GET_PASSENGER_DATA.PASSENGER_DETAILS);
  await sleepMs(randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));

  // Review journey
  console.log("📋 Reviewing journey...");
  await verifyElementByText({ page: page, text: "View Cancellation Policy" });
  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

  if (ENV.AUTO_CAPTCHA) {
    console.log("🤖 Solving CAPTCHA...");
    const captchaText = await solveCaptcha(page, "Captcha Image here");
    await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));

    await fillInputText(page, "Enter Captcha", captchaText, "placeholder");
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    await page.keyboard.press("Tab");
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await page.keyboard.press("Tab");
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await page.keyboard.press("Enter");
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  // Handle payment
  console.log("💳 Processing payment...");
  await verifyElementByText({ page: page, text: "Safe & Secure Payments" });
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  if (GET_PASSENGER_DATA.UPI_ID_CONFIG) {
    await handleUPIPayment(page, GET_PASSENGER_DATA.UPI_ID_CONFIG);
  } else {
    await handleWalletPayment(page);
  }

  await sleepMs(randomDelay(TIMEOUTS.SHORT, TIMEOUTS.VERY_LONG));
  console.log("🎉 Ticket booked successfully!");
});
