import { TIMEOUTS } from "../enums/enums.js";
import { expect } from "@playwright/test";
import { getPassengerData } from "../utility/fetchPassengerData.js";

async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniform(min, max) {
  return Math.random() * (max - min) + min;
}

function randomDelay(min, max) {
  return randint(min, max);
}

function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Move mouse randomly to simulate human behavior
 */
async function randomMouseMovement(page) {
  const viewport = page.viewportSize();
  const x = Math.floor(Math.random() * viewport.width);
  const y = Math.floor(Math.random() * viewport.height);
  
  await page.mouse.move(x, y, { steps: 10 });
  await new Promise(resolve => setTimeout(resolve, randomDelay(100, 300)));
}

/**
 * Scroll page randomly
 */
async function randomScroll(page) {
  const scrollAmount = Math.floor(Math.random() * 300) + 100;
  await page.evaluate((amount) => {
    window.scrollBy(0, amount);
  }, scrollAmount);
  await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1000)));
}

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

  // Wait and interact with human-like behavior
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.hover();
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.click();
  return element;
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
};

async function waitUntilTatkalBookingTime(FETCHED_PASSENGER_DATA) {
  // Internal business rules
  let targetHour, targetMinute, targetSecond;

  if (FETCHED_PASSENGER_DATA.TRAIN_COACH === "SL") {
    targetHour = 10;
    targetMinute = 0;
    targetSecond = 2;
  } else {
    targetHour = 11;
    targetMinute = 0;
    targetSecond = 2;
  }

  while (true) {
    const now = new Date();

    if (
      now.getHours() === targetHour &&
      now.getMinutes() === targetMinute &&
      now.getSeconds() >= targetSecond
    ) {
      console.log("🚀 Exact time reached!");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function verifyElementByText({
  page = null,
  text,
  widget = null,
  timeout = TIMEOUTS.WAIT_FOR_ELEMENT,
}) {
  // Validation: at least one must be provided
  if (!page && !widget) {
    throw new Error("Either page or widget must be provided");
  }

  // Priority: widget first, then page
  const root = page ? page : widget;
  const locator = root.locator(`text=${text}`).first();

  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeAttached({ timeout });

  return locator;
}

export {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
  choice,
  waitUntilTatkalBookingTime,

  // Playwright utilities
  hoverAndClick,
  fillInputText,
  sleepMsAndPressSeq,
  verifyElementByText,
};
