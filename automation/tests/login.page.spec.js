import { test } from "../fixtures/kameleo.fixture.js";
import { getPassengerData } from "../utility/fetchPassengerData.js";
import { sleepMs, randomDelay,waitUntilTatkalBookingTime } from "../utility/utility.js";
import { TIMEOUTS } from "../enums/enums.js";
import { validatePassengerData } from "../utility/validators.js";

// Page Objects
import { LoginPage } from "../pages/LoginPage.js";
import { HomePage } from "../pages/HomePage.js";
import { TrainSelectionPage } from "../pages/TrainSelectionPage.js";
import { PassengerDetailsPage } from "../pages/PassengerDetailsPage.js";
import { PaymentPage } from "../pages/PaymentPage.js";

test.beforeAll(async () => {
  const FETCHED_PASSENGER_DATA = await getPassengerData();
  validatePassengerData(FETCHED_PASSENGER_DATA);
});

test("automated ticket booking", async ({ page }) => {
  const FETCHED_PASSENGER_DATA = await getPassengerData();

  // Initialize Page Objects
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const trainSelectionPage = new TrainSelectionPage(page);
  const passengerDetailsPage = new PassengerDetailsPage(page);
  const paymentPage = new PaymentPage(page);

  // Login
  await loginPage.performLogin(
    FETCHED_PASSENGER_DATA.USERNAME,
    FETCHED_PASSENGER_DATA.PASSWORD,
  );

  // Search train
  await homePage.searchTrain(
    FETCHED_PASSENGER_DATA.SOURCE_STATION,
    FETCHED_PASSENGER_DATA.DESTINATION_STATION,
    FETCHED_PASSENGER_DATA.TRAVEL_DATE,
    FETCHED_PASSENGER_DATA.TATKAL,
    FETCHED_PASSENGER_DATA.PREMIUM_TATKAL
  );

  // Pick train
  // waitUntilTatkalBookingTime(FETCHED_PASSENGER_DATA);
  await trainSelectionPage.pickTrain(
    FETCHED_PASSENGER_DATA.TRAIN_NO,
    FETCHED_PASSENGER_DATA.TRAIN_COACH,
    FETCHED_PASSENGER_DATA.TATKAL,
    FETCHED_PASSENGER_DATA.PREMIUM_TATKAL
  );

  // Fill passenger details
  await passengerDetailsPage.handlePassengerInput(
    FETCHED_PASSENGER_DATA.PASSENGER_DETAILS
  );

  await paymentPage.verifyJourneyReview();

  await paymentPage.processPayment(FETCHED_PASSENGER_DATA.UPI_ID_CONFIG);

  await sleepMs(randomDelay(TIMEOUTS.LONG, TIMEOUTS.VERY_LONG));
  console.log("🎉 Ticket booked successfully!");
});
