const { PassThrough } = require("stream");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
} = require("../helpers/delay");
const PASSENGER_DATA = require("../fixtures/passenger.data.json");
const { TIMEOUTS } = require("../enums/enums");


async function hoverAndClick(page, selector) {
  // await scrollIntoView(page, selector);
  let element;

  // Detect selector type by pattern
  if (
    selector.match(/^[#.\[\]]/) ||
    selector.includes(">>") ||
    selector.startsWith("//")
  ) {
    // CSS selector or XPath
    element = page.locator(selector);
  } else {
    // Assume it's placeholder text
    element = page.getByPlaceholder(selector);
  }

  // Wait for element to be visible
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

  await element.hover();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.click();
  return element;
}

// async function handleCoachClass(page) {
//     let coachClass;
//     hoverAndClick(page, "#journeyClass");
//     if (PASSENGER_DATA)
// }

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
    await sleepMs(randomDelay(TIMEOUTS.VERYSHORT, TIMEOUTS.SHORT));
  }
}

async function handleSinglePassengerInput(page) {
  const nameFld = await page.getByPlaceholder("Name");
  await hoverAndClick(page, "Name");
  await nameFld.pressSequentially(PASSENGER_DATA.PASSENGER_DETAILS.NAME);
  await page.keyboard.press("Tab");
  await page.pressSequentially(PASSENGER_DATA.PASSENGER_DETAILS.AGE);
  await page.keyboard.press("Tab");
  await page.pressSequentially(PASSENGER_DATA.PASSENGER_DETAILS.GENDER);
  await page.keyboard.press("Tab");
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.keyboard.press("Tab");
  await page.pressSequentially(PASSENGER_DATA.PASSENGER_DETAILS.SEAT);
  await page.keyboard.press("Tab");
  await page.pressSequentially(PASSENGER_DATA.PASSENGER_DETAILS.FOOD);
}

async function handlePassengerInput(page) {
  if (PASSENGER_DATA.PASSENGER_DETAILS.PASSENGER_DETAILS.length > 1) {
    for (let i = 0; i < PASSENGER_DATA.PASSENGER_DETAILS.length; i++)
      await handleSinglePassengerInput(page);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
  } else {
    await handleSinglePassengerInput(page);
  }
}

async function fillInputText(page, locator, inputText) {
  const element = await hoverAndClick(page, locator);
  await sleepMs(randomDelay(TIMEOUTS.VERYSHORT, TIMEOUTS.SHORT));

  // Primary clear attempt
  try {
    await element.clear();
  } catch (err) {
    console.log("clear() failed → applying CTRL+A + Backspace fallback...");

    try {
      // Fallback: CTRL+A then Backspace
      await element.focus();
      await page.keyboard.press("Control+A");
      await sleepMs(100);
      await page.keyboard.press("Backspace");
    } catch (fallbackErr) {
      throw new Error(
        "Both clear() and CTRL+A failed → " + fallbackErr.message
      );
    }
  }

  // Type text
  await sleepMs(randomDelay(TIMEOUTS.VERYSHORT, TIMEOUTS.SHORT));
  await element.pressSequentially(inputText, {
    delay: randomDelay(
      TIMEOUTS.MIN_PRESS_SEQ_WAIT,
      TIMEOUTS.MAX_PRESS_SEQ_WAIT
    ),
  });

  return element;
}


async function scrollIntoView (page, selector){
  const element = await page.locator(selector);
  await element.scrollIntoViewIfNeeded();

};


async function pickTrain(page, trainNumber, trainCoach) {
  const widgets = page.locator(
    ".form-group.no-pad.col-xs-12.bull-back.border-all"
  );
  const widgetCount = await widgets.count();

  for (let i = 0; i < widgetCount; i++) {
    const widget = widgets.nth(i);
    const txt = await widget.textContent();

    if (txt && txt.includes(trainNumber)) {
      const coach = widget.locator(`text=${trainCoach}`).first();

      if ((await coach.count()) > 0) {
        await coach.click();
        await sleepMs(randomDelay(TIMEOUTS.VERYSHORT, TIMEOUTS.SHORT));

        const DAY = PASSENGER_DATA.TRAVEL_DATE.split("/")[0];
        const bookingDate = widget.locator(`text=${DAY}`).first(); // No await
        await bookingDate.click(); // Add await
        await sleepMs(randomDelay(TIMEOUTS.VERYSHORT, TIMEOUTS.SHORT));

        const bookNowBtn = widget.locator("text=Book Now").first();
        await bookNowBtn.click();

        return true;
      }
    }
  }

  return false;
}




module.exports = {
  hoverAndClick,
  handlePassengerInput,
  fillInputText,
  handleTicketType,
  scrollIntoView,
  pickTrain,
};
