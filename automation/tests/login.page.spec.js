import { test } from "../fixtures/kameleo.fixture.js";
import { sleepMs, randomDelay,waitUntilTatkalBookingTime } from "../utility/utility.js";
import { TIMEOUTS } from "../enums/enums.js";
import { validatePassengerData } from "../utility/validators.js";
import PASSENGER_DATA from "../fixtures/passenger.data.json" assert {type:"json"};
import ENV from "../irctc.env.json" assert{type:"json"};

// Page Objects
import { LoginPage } from "../pages/LoginPage.js";
import { HomePage } from "../pages/HomePage.js";
import { TrainSelectionPage } from "../pages/TrainSelectionPage.js";
import { PassengerDetailsPage } from "../pages/PassengerDetailsPage.js";
import { PaymentPage } from "../pages/PaymentPage.js";
import {ReviewPage} from "../pages/ReviewPage.js"

test.beforeAll(async () => {
  validatePassengerData(PASSENGER_DATA);
});

test("automated ticket booking", async ({ page }) => {
  // Initialize Page Objects
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const trainSelectionPage = new TrainSelectionPage(page);
  const passengerDetailsPage = new PassengerDetailsPage(page);
  const paymentPage = new PaymentPage(page);
  const reviewPage = new ReviewPage(page);

  // Login
  await loginPage.performLogin(
    ENV.USERNAME,
    ENV.PASSWORD,
  );

  // Search train
  await homePage.searchTrain(
    PASSENGER_DATA.SOURCE_STATION,
    PASSENGER_DATA.DESTINATION_STATION,
    PASSENGER_DATA.TRAVEL_DATE,
    PASSENGER_DATA.TATKAL,
    PASSENGER_DATA.PREMIUM_TATKAL
  );

  // Pick train
  // waitUntilTatkalBookingTime(PASSENGER_DATA);
  await trainSelectionPage.pickTrain(
    PASSENGER_DATA.TRAIN_NO,
    PASSENGER_DATA.TRAIN_COACH,
    PASSENGER_DATA.TATKAL,
    PASSENGER_DATA.PREMIUM_TATKAL
  );

  // Fill passenger details
  await passengerDetailsPage.handlePassengerInput(
    PASSENGER_DATA.PASSENGER_DETAILS
  );

  await reviewPage.processReviewJourneyPage(PASSENGER_DATA);

  await paymentPage.processPaymentType(PASSENGER_DATA.UPI_ID_CONFIG);

  await sleepMs(randomDelay(TIMEOUTS.LONG, TIMEOUTS.VERY_LONG));
  console.log("🎉 Ticket booked successfully!");
});
