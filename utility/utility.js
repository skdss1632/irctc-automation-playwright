const { PassThrough } = require("stream");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
} = require("./delay");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const { TIMEOUTS } = require("../enums/enums");

async function hoverAndClick(page, selector, selectorType = "auto") {
  let element;

  // Select based on type
  switch (selectorType) {
    case "placeholder":
      element = page.getByPlaceholder(selector);
      break;
    case "role":
      element = page.getByRole(selector);
      break;
    case "text":
      element = page.getByText(selector);
      break;
    case "label":
      element = page.getByLabel(selector);
      break;
    default:
      // Auto - use locator (handles CSS, XPath, text selectors)
      element = page.locator(selector).first();
  }

  // Wait and interact
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.hover();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.click();
  return element;
}

async function handleTicketType(page) {
  if (PASSENGER_DATA.TATKAL || PASSENGER_DATA.PREMIUM_TATKAL) {
    hoverAndClick(page, "#journeyQuota");
    let ticketType;
    if (PASSENGER_DATA.TATKAL) {
      ticketType = page.locator("//li[contains(@aria-label, 'TATKAL')]");
    } else if (PASSENGER_DATA.PREMIUM_TATKAL) {
      ticketType = page.locator(
        "//li[contains(@aria-label, 'PREMIUM TATKAL')]"
      );
    }
    hoverAndClick(page, ticketType);
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }
}

async function handlePassengerInput(page, passengerDetails) {
  for (let i = 0; i < passengerDetails.length; i++) {
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
    await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    // Seat
    const seatDropdown = page
      .locator("select[formcontrolname='passengerBerthChoice']")
      .nth(i);
    await seatDropdown.click();
    await seatDropdown.selectOption(passengerDetails[i].SEAT);
    if (i < passengerDetails.length-1){
      await page.locator("text=+ Add Passenger").click();
      await page
        .getByPlaceholder("Name")
        .nth(i + 1)
        .waitFor({ state: "visible" });
    }

  }
}

async function fillInputText(page, locator, inputText, selectorType) {
  const element = await hoverAndClick(page, locator, selectorType);
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await sleepMsAndPressSeq(element, inputText);
  return element;
}

const sleepMsAndPressSeq = async (element, inputText) => {
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.pressSequentially(inputText, {
    delay: randomDelay(
      TIMEOUTS.MIN_PRESS_SEQ_WAIT,
      TIMEOUTS.MAX_PRESS_SEQ_WAIT
    ),
  });
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
};

async function scrollIntoView(page, selector) {
  const element = await page.locator(selector);
  await element.scrollIntoViewIfNeeded();
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
      return true; // to exit from the loop if text matched
    }
  }
}

module.exports = {
  hoverAndClick,
  handlePassengerInput,
  fillInputText,
  handleTicketType,
  scrollIntoView,
  pickTrain,
};
