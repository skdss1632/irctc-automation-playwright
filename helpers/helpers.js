const {
  sleepMs,
  randomDelay,
  hoverAndClick,
  fillInputText,
  sleepMsAndPressSeq,
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
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "User Name", ENV.IRCTC_USERNAME, "placeholder");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await fillInputText(page, "password", ENV.IRCTC_PASSWORD, "placeholder");
  await page.keyboard.press("Tab");
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

  await fillInputText(page, "#jDate", passengerData.TRAVEL_DATE);
  await sleepMs(
    randomDelay(TIMEOUTS.MIN_TRAIN_SEARCH_WAIT, TIMEOUTS.MAX_TRAIN_SEARCH_WAIT)
  );
  await page.keyboard.press("Enter");

  await handleTicketType(page);
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
}

async function handleTicketType(page) {
  if (PASSENGER_DATA.TATKAL || PASSENGER_DATA.PREMIUM_TATKAL) {
    await hoverAndClick(page, "#journeyQuota");
    let ticketType;
    if (PASSENGER_DATA.TATKAL) {
      ticketType = page.locator("//li[contains(@aria-label, 'TATKAL')]");
    } else if (PASSENGER_DATA.PREMIUM_TATKAL) {
      ticketType = page.locator(
        "//li[contains(@aria-label, 'PREMIUM TATKAL')]"
      );
    }
    await hoverAndClick(page, ticketType);
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }
}


async function pickTrain(page, trainNumber, trainCoach) {
  const widgets = page.locator(
    ".form-group.no-pad.col-xs-12.bull-back.border-all"
  );
  const widgetCount = await widgets.count();

  for (let i = 0; i < widgetCount; i++) {
    const widget = widgets.nth(i);
    const txt = await widget.textContent();

    if (txt && txt.includes(trainNumber)) {
      const coach = await widget.locator(`text=${trainCoach}`);
      await coach.click();

      const bookingDate = await widget
        .locator(".link.ng-star-inserted")
        .first();
      await bookingDate.click();
      await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

      const bookNowBtn = widget.locator("text=Book Now");
      await bookNowBtn.click();
      await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
      return true;
    }
  }
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
}


async function handleUPIPayment(page, upiId) {
  // pay and book btn
  await page.locator(".btn.btn-primary.hidden-xs.ng-star-inserted").click();
  // radio btn selection
  await page.locator('input[type="radio"][value="upiMandate"]').check();
  // upi id input fld
  const widget = page.locator("#upiMandate_wrapper");
  const upiInput = widget.locator("#mndtVpa");
  await upiInput.click();
  await upiInput.pressSequentially(upiId);
  // pay btn
  await page.locator("#autoDebitBtn").click();
}


async function handleWalletPayment(page) {
  // wallet selection
  await page.getByAltText("Text= (Instant Payment)").click();
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
