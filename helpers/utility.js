const { PassThrough } = require("stream");
const {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
} = require("../helpers/delay");
const PASSENGER_DETAILS = require("../fixtures/passenger.data.json");

async function hoverAndClick(page, locator) {
  const element = page.locator(locator);
  await element.hover();
  await sleepMs(randomDelay(300, 500));
  await element.click();
}

// async function handleCoachClass(page) {
//     let coachClass;
//     hoverAndClick(page, "#journeyClass");
//     if (PASSENGER_DETAILS)
// }

async function handleTicketType(page) {
  if (PASSENGER_DETAILS.TATKAL || PASSENGER_DETAILS.PREMIUM_TATKAL) {
    let ticketType;
    hoverAndClick(page, "#journeyQuota");
    if (PASSENGER_DETAILS.TATKAL) {
      ticketType = page.locator("//li[contains(@aria-label, 'TATKAL')]");
    } else if (PASSENGER_DETAILS.PREMIUM_TATKAL) {
      ticketType = page.locator(
        "//li[contains(@aria-label, 'PREMIUM TATKAL')]"
      );
    }
    hoverAndClick(page, ticketType);
    await sleepMs(randomDelay(300, 500));
  }
}

module.exports = hoverAndClick;
