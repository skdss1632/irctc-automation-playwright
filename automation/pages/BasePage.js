import { expect } from "@playwright/test";
import { TIMEOUTS, RETRY, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";
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
    await new Promise((resolve) =>
      setTimeout(resolve, this.randomDelay(500, 1000))
    );
  }

  async hoverAndClick(selector, selectorType = "auto") {
    let locator;

    switch (selectorType) {
      case "placeholder":
        locator = this.page.getByPlaceholder(selector);
        break;
      case "role":
        locator = this.page.getByRole(selector);
        break;
      case "text":
        locator = this.page.getByText(selector);
        break;
      case "label":
        locator = this.page.getByLabel(selector);
        break;
      default:
        locator = this.page.locator(selector).first();
    }

    // await locator.hover();
    await locator.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    return locator;
  }

  async fillInputText(locator, inputText, selectorType = "auto") {
    const clickedLocator = await this.hoverAndClick(locator, selectorType);
    await this.page.keyboard.press("Control+A");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Backspace");
    await this.pressSequentially(clickedLocator, inputText);
    return clickedLocator;
  }

  async pressSequentially(locator, inputText) {
    await locator.pressSequentially(inputText, {
      delay: this.randomDelay(TIMEOUTS.MIN_PRESS_SEQ, TIMEOUTS.MAX_PRESS_SEQ),
    });
  }

  async verifyLocatorByText(text, timeout = VALIDATE_LOCATOR_TIMEOUT.DEFAULT) {
    const locator = this.page.locator(`text=${text}`).first();

    try {
      await expect(locator).toBeVisible({ timeout });
      await expect(locator).toBeAttached({ timeout });
      return true;
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

  async submitCaptcha() {
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Enter");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  async inputCaptcha(locator, captchaText) {
    await this.fillInputText(locator, captchaText, "placeholder");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    // submit captcha will keep here only so can validate captcha is successful or not so we can retry if needed
    await this.submitCaptcha();
  }

  async inputCaptchaWithRetry({
    captchaInput,
    captchaLocator,
    invalidCaptchaLocator,
    maxAttempts = RETRY.MAX_CAPTCHA_RETRY,
    textLocator,
    timeout,
  }) {
    const captchaSolved = await this._attemptCaptchaSolving({
      captchaInput,
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

    return true; // ✅ Explicit success return
  }

  async _attemptCaptchaSolving({
    captchaInput,
    captchaLocator,
    invalidCaptchaLocator,
    textLocator,
    maxAttempts,
    timeout,
  }) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔁 CAPTCHA Attempt ${attempt}/${maxAttempts}`);

      const isSuccess = await this._trySingleCaptchaAttempt({
        captchaInput,
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
    captchaInput,
    captchaLocator,
    invalidCaptchaLocator,
    textLocator,
    timeout,
  }) {
    const captchaText = await solveCaptcha(this.page, captchaLocator);
    console.log(`🔤 OCR result: "${captchaText}"`);

    await this.inputCaptcha(captchaInput, captchaText);
    const isInvalid = await this.checkInvalidCaptchaMessage({
      invalidCaptchaLocator: invalidCaptchaLocator,
    });

    if (isInvalid) {
      // Captcha was wrong
      return false;
    }

    // 4. Captcha was correct - verify success page element
    console.log("✅ Captcha valid, verifying success element...");
    await this.verifyLocatorByText(textLocator, timeout);
    return true; // Success!
  }

  async checkInvalidCaptchaMessage({
    invalidCaptchaLocator,
    timeout = VALIDATE_LOCATOR_TIMEOUT.INVALID_CAPTCHA,
  }) {
    try {
      let result = await this.verifyLocatorByText(
        invalidCaptchaLocator,
        timeout
      );
      if (result) {
        return true;
      }
    } catch (e) {
      return false; // Invalid message not found (captcha is valid)
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
