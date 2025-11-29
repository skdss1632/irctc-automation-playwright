const {
  sleepMs,
  randomDelay,
  hoverAndClick,
  fillInputText,
  sleepMsAndPressSeq,
  verifyElementByText,
} = require("../utility/utility");
const { TIMEOUTS } = require("../enums/enums");
const { solveCaptcha, checkOCRServer } = require("../utility/ocr-utility");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const ENV = require("../irctc.env.json");

async function performLogin(page, captchaSelector) {
  const ocrServerRunning = await checkOCRServer();
  if (!ocrServerRunning) {
    console.warn("⚠️ OCR server not running. CAPTCHA must be solved manually.");
  }
  await page.locator("text=LOGIN").first().click();
  await verifyElementByText({ page: page, text: "SIGN IN" });

  await fillInputText(page, "User Name", ENV.IRCTC_USERNAME, "placeholder");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "password", ENV.IRCTC_PASSWORD, "placeholder");
  await page.keyboard.press("Tab");
  if(ENV.AUTO_CAPTCHA){
    // Solve CAPTCHA
    const captchaText = await solveCaptcha(page, captchaSelector);
    console.log(`📝 Extracted CAPTCHA: ${captchaText}`);
    // Fill CAPTCHA input
    await fillInputText(page, "Enter Captcha", captchaText, "placeholder");
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    // Click Sign In / Submit button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  }
  console.log("✅ Login successful");
}

async function searchTrain(page, passengerData) {
  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter From station')]",
    passengerData.SOURCE_STATION
  );
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await fillInputText(
    page,
    "//input[contains(@aria-label, 'Enter To station')]",
    passengerData.DESTINATION_STATION
  );
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await handleTicketType(page);
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "#jDate", passengerData.TRAVEL_DATE);
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  console.log("searched train successfully");
}

async function handleTicketType(page) {
  if (PASSENGER_DATA.TATKAL || PASSENGER_DATA.PREMIUM_TATKAL) {
    await hoverAndClick(page, "#journeyQuota");
    let ticketType;
    if (PASSENGER_DATA.TATKAL) {
      ticketType = "//li[contains(@aria-label, 'TATKAL')]";
    } else if (PASSENGER_DATA.PREMIUM_TATKAL) {
      ticketType = "//li[contains(@aria-label, 'PREMIUM TATKAL')]";
    }
    await hoverAndClick(page, ticketType);
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }
}

async function pickTrain(page, trainNumber, trainCoach) {
  const trainWidgets = page.locator(
    ".form-group.no-pad.col-xs-12.bull-back.border-all"
  );
  const count = await trainWidgets.count();

  for (let i = 0; i < count; i++) {
    const widget = trainWidgets.nth(i);
    const content = await widget.textContent();

    if (!content || !content.includes(trainNumber)) continue;

    // Coach type container
    const coachTypeWidget = widget.locator(
      ".white-back.col-xs-12.ng-star-inserted"
    );

    // Try seat selection
    const coachSelected = await selectSeatType(trainCoach, coachTypeWidget);
    if (!coachSelected) continue;

    // Booking date widget
    const bookingDateWidget = widget.locator(".col-xs-12.ng-star-inserted");

    await clickWithRetry(bookingDateWidget, trainCoach);

    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    await widget.locator("text=Book Now").click();
    console.log("clicked on book now btn");

    return true;
  }
  return false;
}

async function clickWithRetry(bookingDateWidget, trainCoachSelector) {
  const label =
    PASSENGER_DATA.TATKAL || PASSENGER_DATA.PREMIUM_TATKAL ? "AVAILABLE" : "WL";

  await verifyElementByText({
    text: label,
    widget: bookingDateWidget,
    timeout: 60000,
  });

  const bookingDate = bookingDateWidget
    .locator(".link.ng-star-inserted")
    .first();

  try {
    await bookingDate.click();
  } catch {
    console.log("unable to click on booking data trying to click again.....");
    const coachLocator = bookingDateWidget.locator(
      `text=${trainCoachSelector}`
    );
    const coachText = await coachLocator.textContent();

    if (coachText && coachText.includes(trainCoachSelector)) {
      await coachLocator.click();
    }

    // re-verify before retry
    await verifyElementByText({
      text: label,
      widget: bookingDateWidget,
      timeout: 10000,
    });

    await bookingDate.click();
  }
}

// traindetails widgets
// find texts in every widget i.e train number

// if found then get coachtypewidget

// now find pre-avl(buttons) class in coachtype widget

// found pre-avl with text match i.e sl click

async function selectSeatType(trainCoach, coachTypeWidget) {
  const seatElements = await coachTypeWidget.locator(".pre-avl").all();
  for (const element of seatElements) {
    const text = await element.textContent();
    const cleanText = text.split("Refresh")[0].trim();

    console.log("Found seat type:", cleanText);

    // Check if text matches user preference (case insensitive)
    if (cleanText.toLowerCase().includes(trainCoach.toLowerCase())) {
      console.log(`Matched! Clicking on: ${cleanText}`);
      await element.click();
      return true;
    }
  }
  console.log(`No seat type found matching: ${trainCoach}`);
  return false;
}

async function handlePassengerInput(page, passengerDetails) {
  for (let i = 0; i < passengerDetails.length; i++) {
    // Name
    const nameFld = await page.getByPlaceholder("Name").nth(i);
    await nameFld.click();
    await sleepMsAndPressSeq(nameFld, passengerDetails[i].NAME);

    // Age
    const ageFld = await page.getByPlaceholder("Age").nth(i);
    await ageFld.click();
    await sleepMsAndPressSeq(ageFld, passengerDetails[i].AGE.toString());

    // Gender
    const genderDropdown = page
      .locator("select[formcontrolname='passengerGender']")
      .nth(i);
    await genderDropdown.click();
    await genderDropdown.selectOption(passengerDetails[i].GENDER);

    // Seat
    const seatDropdown = page
      .locator("select[formcontrolname='passengerBerthChoice']")
      .nth(i);
    await seatDropdown.click();
    await seatDropdown.selectOption(passengerDetails[i].SEAT);

    // Add next passenger if not the last one
    if (i < passengerDetails.length - 1) {
      await page.locator("text=+ Add Passenger").click();
      await page
        .getByPlaceholder("Name")
        .nth(i + 1)
        .waitFor({ state: "visible" });
    }
  }
  console.log("passenger details filled successfully");
  await page.locator("text=Consider for Auto Upgradation").click();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  const continueBtn = await page.locator("text=Continue").first();
  await continueBtn.click();
}

async function handleUPIPayment(page, upiId) {
  // pay and book btn
  await page.locator(".btn.btn-primary.hidden-xs.ng-star-inserted").click();
  await verifyElementByText({
    page: page,
    text: "Mandate Based Payment Instruments",
  });
  // radio btn selection
  await page.locator('input[type="radio"][value="upiMandate"]').check();
  // upi id input fld
  const widget = page.locator("#upiMandate_wrapper");
  const upiInput = widget.locator("#mndtVpa");
  await upiInput.click();
  await upiInput.pressSequentially(upiId);
  console.log("filled upi id");
  // pay btn
  await page.locator("#autoDebitBtn").click();
}

async function handleWalletPayment(page) {
  // wallet selection
  await page.getByAltText("Text= (Instant Payment)").click();
  // pay n book btn
  await page.locator(".btn.btn-primary.hidden-xs.ng-star-inserted").click();
  await verifyElementByText({
    page: page,
    text: "Current IRCTC eWallet Balance",
  });
  // const confirmBtn = await page.locator(".mob-bot-btn.search_btn");
  // confirmBtn.click();
  // confirm btn using wallet pay -- do not uncomment the below line as of now
  // await page.locator(".train_Search.btnDefault").click();
}

function validatePassengerData(passengerData) {
  // Train details
  if (!passengerData.TRAIN_NO || passengerData.TRAIN_NO.trim() === "") {
    throw new Error("TRAIN_NO is required and cannot be empty");
  }

  if (!passengerData.TRAIN_COACH || passengerData.TRAIN_COACH.trim() === "") {
    throw new Error("TRAIN_COACH is required and cannot be empty");
  }

  // Stations
  if (
    !passengerData.SOURCE_STATION ||
    passengerData.SOURCE_STATION.trim() === ""
  ) {
    throw new Error("SOURCE_STATION is required and cannot be empty");
  }

  if (
    !passengerData.DESTINATION_STATION ||
    passengerData.DESTINATION_STATION.trim() === ""
  ) {
    throw new Error("DESTINATION_STATION is required and cannot be empty");
  }

  // Travel date
  if (!passengerData.TRAVEL_DATE || passengerData.TRAVEL_DATE.trim() === "") {
    throw new Error("TRAVEL_DATE is required and cannot be empty");
  }

  // ========== Date Format Validation ==========

  // Validate date format (DD/MM/YYYY)
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!datePattern.test(passengerData.TRAVEL_DATE)) {
    throw new Error(
      "TRAVEL_DATE must be in DD/MM/YYYY format (e.g., 30/11/2025)"
    );
  }

  // Validate date is valid and not in past
  const [day, month, year] = passengerData.TRAVEL_DATE.split("/").map(Number);
  const travelDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(travelDate.getTime())) {
    throw new Error(`Invalid TRAVEL_DATE: ${passengerData.TRAVEL_DATE}`);
  }

  if (travelDate < today) {
    throw new Error("TRAVEL_DATE cannot be in the past");
  }

  // ========== Coach Validation ==========

  const validCoaches = ["SL", "2A", "3A", "3E", "1A", "CC", "EC", "2S"];
  if (!validCoaches.includes(passengerData.TRAIN_COACH.toUpperCase())) {
    throw new Error(
      `Invalid TRAIN_COACH: "${
        passengerData.TRAIN_COACH
      }". Valid options: ${validCoaches.join(", ")}`
    );
  }

  // ========== Tatkal Validation ==========

  if (typeof passengerData.TATKAL !== "boolean") {
    throw new Error("TATKAL must be a boolean (true/false)");
  }

  if (typeof passengerData.PREMIUM_TATKAL !== "boolean") {
    throw new Error("PREMIUM_TATKAL must be a boolean (true/false)");
  }

  // Cannot select both Tatkal and Premium Tatkal
  if (passengerData.TATKAL && passengerData.PREMIUM_TATKAL) {
    throw new Error(
      "Cannot select both TATKAL and PREMIUM_TATKAL. Choose only one."
    );
  }

  // Premium Tatkal only for AC classes
  if (passengerData.PREMIUM_TATKAL) {
    const acClasses = ["1A", "2A", "3A", "3E", "CC", "EC"];
    if (!acClasses.includes(passengerData.TRAIN_COACH.toUpperCase())) {
      throw new Error(
        `PREMIUM_TATKAL is only available for AC classes (${acClasses.join(
          ", "
        )}). Selected: ${passengerData.TRAIN_COACH}`
      );
    }
  }

  // ========== Passenger Details Validation ==========

  if (
    !passengerData.PASSENGER_DETAILS ||
    !Array.isArray(passengerData.PASSENGER_DETAILS)
  ) {
    throw new Error("PASSENGER_DETAILS must be an array");
  }

  if (passengerData.PASSENGER_DETAILS.length === 0) {
    throw new Error("At least one passenger is required in PASSENGER_DETAILS");
  }

  if (passengerData.PASSENGER_DETAILS.length > 6) {
    throw new Error("Maximum 6 passengers allowed per booking");
  }

  // Valid options
  const validSeats = [
    "Lower",
    "Middle",
    "Upper",
    "Side Lower",
    "Side Upper",
    "Window Side",
    "No Preference",
  ];
  const validGenders = ["Male", "Female", "Transgender"];
  const validFoodChoices = ["Veg", "Non Veg", "No Food"];

  // Validate each passenger
  passengerData.PASSENGER_DETAILS.forEach((passenger, index) => {
    const passengerNum = index + 1;

    // Name
    if (!passenger.NAME || passenger.NAME.trim() === "") {
      throw new Error(
        `Passenger ${passengerNum}: NAME is required and cannot be empty`
      );
    }

    // Name should only contain letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(passenger.NAME)) {
      throw new Error(
        `Passenger ${passengerNum}: NAME can only contain letters and spaces`
      );
    }

    // Age
    if (!passenger.AGE && passenger.AGE !== 0) {
      throw new Error(`Passenger ${passengerNum}: AGE is required`);
    }

    if (typeof passenger.AGE !== "number") {
      throw new Error(`Passenger ${passengerNum}: AGE must be a number`);
    }

    if (passenger.AGE < 1 || passenger.AGE > 120) {
      throw new Error(
        `Passenger ${passengerNum}: AGE must be between 1 and 120 (current: ${passenger.AGE})`
      );
    }

    // Age rules
    if (passenger.AGE < 5) {
      console.warn(
        `Passenger ${passengerNum}: Children under 5 years travel free and don't need a separate ticket`
      );
    }

    if (passenger.AGE >= 60) {
      console.log(
        `Passenger ${passengerNum}: Senior citizen discount may apply (age: ${passenger.AGE})`
      );
    }

    // Gender
    if (!passenger.GENDER || passenger.GENDER.trim() === "") {
      throw new Error(`Passenger ${passengerNum}: GENDER is required`);
    }

    if (!validGenders.includes(passenger.GENDER)) {
      throw new Error(
        `Passenger ${passengerNum}: Invalid GENDER "${
          passenger.GENDER
        }". Valid options: ${validGenders.join(", ")}`
      );
    }

    // Seat preference
    if (!passenger.SEAT || passenger.SEAT.trim() === "") {
      throw new Error(`Passenger ${passengerNum}: SEAT preference is required`);
    }

    if (!validSeats.includes(passenger.SEAT)) {
      throw new Error(
        `Passenger ${passengerNum}: Invalid SEAT "${
          passenger.SEAT
        }". Valid options: ${validSeats.join(", ")}`
      );
    }

    // Food choice (optional but validate if provided)
    if (passenger.FOOD) {
      if (!validFoodChoices.includes(passenger.FOOD)) {
        throw new Error(
          `Passenger ${passengerNum}: Invalid FOOD choice "${
            passenger.FOOD
          }". Valid options: ${validFoodChoices.join(", ")}`
        );
      }
    }
  });

  // ========== Boarding Station Validation ==========

  if (
    passengerData.BOARDING_STATION &&
    passengerData.BOARDING_STATION.trim() !== ""
  ) {
    // Boarding station should not be the same as source
    if (passengerData.BOARDING_STATION === passengerData.SOURCE_STATION) {
      console.warn(
        "BOARDING_STATION is same as SOURCE_STATION. This is redundant."
      );
    }
  }

  // ========== Station Code Validation ==========

  if (passengerData.SOURCE_STATION === passengerData.DESTINATION_STATION) {
    throw new Error(
      "SOURCE_STATION and DESTINATION_STATION cannot be the same"
    );
  }
}

module.exports = {
  validatePassengerData,
  performLogin,
  searchTrain,
  handleTicketType,
  pickTrain,
  handlePassengerInput,
  handleUPIPayment,
  handleWalletPayment,
};
