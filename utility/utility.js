// utility/utility.js
// General-purpose Playwright utility functions (reusable across any project)

const { TIMEOUTS } = require("../enums/enums");

/**
 * Sleep for specified seconds
 */
async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

/**
 * Sleep for specified milliseconds
 */
async function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Random integer between min and max (inclusive) - like Python's random.randint
 */
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max - like Python's random.uniform
 */
function uniform(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Random delay in milliseconds
 */
function randomDelay(min, max) {
  return randint(min, max);
}

/**
 * Random choice from array - like Python's random.choice
 */
function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Hover over an element and click it with human-like delays
 */
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

/**
 * Fill input field with text after clicking and clearing
 */
async function fillInputText(page, locator, inputText, selectorType) {
  const element = await hoverAndClick(page, locator, selectorType);
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await page.keyboard.press("Control+A");
  await page.keyboard.press("Backspace");
  await sleepMsAndPressSeq(element, inputText);
  return element;
}

/**
 * Type text sequentially with random human-like delays
 */
const sleepMsAndPressSeq = async (element, inputText) => {
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.pressSequentially(inputText, {
    delay: randomDelay(
      TIMEOUTS.MIN_PRESS_SEQ_WAIT,
      TIMEOUTS.MAX_PRESS_SEQ_WAIT
    ),
  });
};

/**
 * Scroll element into view if needed
 */
async function scrollIntoView(page, selector) {
  const element = await page.locator(selector);
  await element.scrollIntoViewIfNeeded();
}

module.exports = {
  // Time utilities
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
  choice,

  // Playwright utilities
  hoverAndClick,
  fillInputText,
  sleepMsAndPressSeq,
  scrollIntoView,
};
