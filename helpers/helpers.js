const {
  sleepMs,
  randomDelay,
  hoverAndClick,
  fillInputText,
  sleepMsAndPressSeq,
  verifyElementByText,
} = require("../utility/utility");
const { TIMEOUTS } = require("../enums/enums");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const ENV = require("../playwright.env.json");

function validatePassengerData(passengerData) {
  if (!passengerData.SOURCE_STATION || !passengerData.DESTINATION_STATION) {
    throw new Error("Source and destination stations are required");
  }
  if (
    !passengerData.PASSENGER_DETAILS ||
    passengerData.PASSENGER_DETAILS.length === 0
  ) {
    throw new Error("At least one passenger is required");
  }
  if (
    passengerData.UPI_ID_CONFIG &&
    !passengerData.UPI_ID_CONFIG.includes("@")
  ) {
    throw new Error("Invalid UPI ID format");
  }
}

async function performLogin(page) {
  await page.locator("text=LOGIN").first().click();
  await verifyElementByText({page:page, text:"SIGN IN"});

  await fillInputText(page, "User Name", ENV.IRCTC_USERNAME, "placeholder");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "password", ENV.IRCTC_PASSWORD, "placeholder");
  await page.keyboard.press("Tab");
  console.log("login success");
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
}


async function clickWithRetry(bookingDateWidget, trainCoachSelector) {
  const label =
    PASSENGER_DATA.TATKAL || PASSENGER_DATA.PREMIUM_TATKAL ? "AVAILABLE" : "WL";

  await verifyElementByText({text:label, widget:bookingDateWidget, timeout:10000});

  const bookingDate = bookingDateWidget.locator(".link.ng-star-inserted").first();

  try {
    await bookingDate.click();
  } catch {
    console.log("unable to click on booking data trying to click again.....")
    const coachLocator = bookingDateWidget.locator(
      `text=${trainCoachSelector}`
    );
    const coachText = await coachLocator.textContent();

    if (coachText && coachText.includes(trainCoachSelector)) {
      await coachLocator.click();
    }

    // re-verify before retry
    await verifyElementByText({text:label, widget:bookingDateWidget, timeout:10000});

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
      return true; // Found and clicked
    }
  }
  console.log(`No seat type found matching: ${trainCoach}`);
  return false; // Not found
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
  await verifyElementByText({page:page, text:"Mandate Based Payment Instruments"});
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
  await verifyElementByText({page:page, text:"Confirm"});
  // confirm btn using wallet pay -- do not uncomment the below line as of now
  // await page.locator(".train_Search.btnDefault").click();
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
