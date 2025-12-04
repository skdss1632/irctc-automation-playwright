// pages/BasePage.js
import { expect } from "@playwright/test";
import {
  TIMEOUTS,
  CAPTCHA_RETRY,
  VALIDATE_LOCATOR_TIMEOUT,
} from "../enums/enums.js";
import { solveCaptcha } from "../utility/ocr-utility";

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  async sleepMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async randomScroll(page) {
    const scrollAmount = Math.floor(Math.random() * 300) + 100;
    await page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);
    await new Promise((resolve) => setTimeout(resolve, randomDelay(500, 1000)));
  }

  async hoverAndClick(selector, selectorType = "auto") {
    let element;

    switch (selectorType) {
      case "placeholder":
        element = this.page.getByPlaceholder(selector);
        break;
      case "role":
        element = this.page.getByRole(selector);
        break;
      case "text":
        element = this.page.getByText(selector);
        break;
      case "label":
        element = this.page.getByLabel(selector);
        break;
      default:
        element = this.page.locator(selector).first();
    }

    await element.hover();
    await element.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    return element;
  }

  async fillInputText(locator, inputText, selectorType = "auto") {
    const element = await this.hoverAndClick(locator, selectorType);
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Control+A");
    await this.page.keyboard.press("Backspace");
    await this.pressSequentially(element, inputText);
    return element;
  }

  async pressSequentially(element, inputText) {
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await element.pressSequentially(inputText, {
      delay: this.randomDelay(
        TIMEOUTS.MIN_PRESS_SEQ_WAIT,
        TIMEOUTS.MAX_PRESS_SEQ_WAIT
      ),
    });
  }

  async verifyLocatorByText(text, timeout = VALIDATE_LOCATOR_TIMEOUT.DEFAULT) {
  const locator = this.page.locator(`text=${text}`).first();

  try {
    await expect(locator).toBeVisible({ timeout });
    await expect(locator).toBeAttached({ timeout });  
    return true
  } catch (error) {
    console.error(`verifyLocatorByText failed for text "${text}"`, error);
    throw error; 
  }
}


  async verifyElementInWidget(
    widget,
    text,
    timeout = VALIDATE_LOCATOR_TIMEOUT.DEFAULT
  ) {
    const locator = widget.locator(`text=${text}`).first();
    await expect(locator).toBeVisible({ timeout });
    await expect(locator).toBeAttached({ timeout });
    return locator;
  }

  async submitLogin() {
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Enter");
  }


async inputCaptcha(captchaText) {
  await this.fillInputText(this.captchaInput, captchaText, "placeholder");
  await this.submitLogin();
}


async inputCaptchaWithRetry({
  captchaLocator,
  invalidCaptchaLocator,
  maxAttempts = CAPTCHA_RETRY.MAX_ATTEMPT,
  textLocator,
  timeout,
}) {
  const captchaSolved = await this._attemptCaptchaSolving({
    captchaLocator,
    invalidCaptchaLocator,
    textLocator,
    maxAttempts,
    timeout,
  });

  if (!captchaSolved) {
    throw new Error(
      `❌ Failed to solve CAPTCHA after ${maxAttempts} attempts.`
    );
  }

  return true;  // ✅ Explicit success return
}


async _attemptCaptchaSolving({
  captchaLocator,
  invalidCaptchaLocator,
  textLocator,
  maxAttempts,
  timeout,
}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔁 CAPTCHA Attempt ${attempt}/${maxAttempts}`);

    const isSuccess = await this._trySingleCaptchaAttempt({
      captchaLocator,
      invalidCaptchaLocator,
      textLocator,
      timeout,
    });

    if (isSuccess) {
      console.log(`✅ Attempt ${attempt}: Captcha solved successfully!\n`);
      return true;
    }

    console.log(`❌ Attempt ${attempt}: Invalid captcha, retrying...\n`);
  }

  console.error(`❌ All ${maxAttempts} captcha attempts failed\n`);
  return false;
}


async _trySingleCaptchaAttempt({
  captchaLocator,
  invalidCaptchaLocator,
  textLocator,
  timeout,
}) {
 
    const captchaText = await solveCaptcha(this.page, captchaLocator);
    console.log(`🔤 OCR result: "${captchaText}"`);

    await this.inputCaptcha(captchaText);
    const isInvalid = await this.checkInvalidCaptchaMessage({
      invalidCaptchaLocator: invalidCaptchaLocator,
    });

    if (isInvalid) {
      // Captcha was wrong
      return false;
    }

    // 4. Captcha was correct - verify success page element
    console.log('✅ Captcha valid, verifying success element...');
    await this.verifyLocatorByText(textLocator, timeout);
    return true;  // Success!
}


async checkInvalidCaptchaMessage({
  invalidCaptchaLocator,
  timeout = VALIDATE_LOCATOR_TIMEOUT.INVALID_CAPTCHA,
}) {
  try {
    let result = await this.verifyLocatorByText(invalidCaptchaLocator, timeout);
    if (result){
      return result;
    }
  } catch (e) {
    return false;  // Invalid message not found (captcha is valid)
  }
}


  async randomMouseMovement() {
    const viewport = this.page.viewportSize();
    const x = Math.floor(Math.random() * viewport.width);
    const y = Math.floor(Math.random() * viewport.height);

    await this.page.mouse.move(x, y, { steps: 10 });
    await this.sleepMs(this.randomDelay(100, 300));
  }
}
