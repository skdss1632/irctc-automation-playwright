// pages/BasePage.js
import { expect } from "@playwright/test";
import { TIMEOUTS, CAPTCHA_RETRY, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";
import {solveCaptcha,checkOCRServer} from "../utility/ocr-utility"

export class BasePage {
  constructor(page) {
    this.page = page;
    this.fetchedPassengerData = null; // Will be populated by init()
  }

  async init() {
    if (!this.fetchedPassengerData) {
      this.fetchedPassengerData = await getPassengerData();
    }
    return this;
  }

  async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  // async verifyPageLocator(page, locator, timeout){
  //   await page.locator(locator);
  // }

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
    await new Promise(resolve => setTimeout(resolve, randomDelay(500, 1000)));
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

    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await element.hover();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await element.click();
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

  async verifyElementByText(text, timeout = VALIDATE_LOCATOR_TIMEOUT.DEFAULT) {
    const locator = this.page.locator(`text=${text}`).first();
    await expect(locator).toBeVisible({ timeout });
    await expect(locator).toBeAttached({ timeout });
    return locator;
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
  async autoCaptchaDisabled(autoCaptcha) {
    if (!autoCaptcha) {
      console.log("⚠️ Auto-captcha disabled. Solve manually.");
    }
  }

  async inputCaptcha(captchaText) {
    // Fill CAPTCHA input
    await this.fillInputText(this.captchaInput, captchaText, "placeholder");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  async inputCaptchaWithRetry({
    captchaLocator,
    invalidCaptchaLocatorLogin,
    invalidCaptchaLocatorReview,
    maxAttempts = CAPTCHA_RETRY.MAX_ATTEMPT,
  }) {
    let result = await checkOCRServer();
    if(!result) return;

    let captchaSolved = false;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔁 CAPTCHA Attempt ${attempt}/${maxAttempts}`);
      try {
        const captchaText = await solveCaptcha(this.page, captchaLocator);
        inputCaptcha(captchaText);

        // Check if "Invalid Captcha" message appears
        const isInvalid = await this.checkInvalidCaptchaMessage({
          invalidCaptchaLocatorLogin: invalidCaptchaLocatorLogin,
          invalidCaptchaLocatorReview: invalidCaptchaLocatorReview,
        });

        if (isInvalid) {
          console.log(
            `❌ Attempt ${attempt}: Invalid Captcha detected, retrying...`
          );
          continue; // Go to next attempt
        } else {
          console.log(`✅ Attempt ${attempt}: Captcha accepted successfully!`);
          captchaSolved = true;
          break; // Exit loop
        }
      } catch (error) {
        console.log(`⚠️ Attempt ${attempt}: Error occurred - ${error.message}`);
        await this.sleepMs(this.randomDelay(TIMEOUTS.SHORT, TIMEOUTS.MEDIUM));
        continue;
      }
    }

    if (!captchaSolved) {
      throw new Error(
        `❌ Failed to solve CAPTCHA after ${maxAttempts} attempts.`
      );
    }

    return captchaSolved;  
  }

  async checkInvalidCaptchaMessage({
    invalidCaptchaLocatorLogin = null,
    invalidCaptchaLocatorReview = null,
    timeout = VALIDATE_LOCATOR_TIMEOUT.INVALID_CAPTCHA,
  }) {
    const locator = invalidCaptchaLocatorLogin || invalidCaptchaLocatorReview;
    try{
      this.verifyElementByText(locator, timeout);
      return true;
    }catch(e){
      return false;
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
