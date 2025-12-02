// pages/CaptchaPage.js
import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";
import { solveCaptcha, checkOCRServer } from "../utility/ocr-utility.js";

export class CaptchaPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.captchaInput = "Enter Captcha";
    this.invalidCaptchalocatorReview = "Invalid Captcha";
    this.cancellationPolicyText = "View Cancellation Policy";
  }

  async verifyJourneyReviewPage() {
    await this.verifyElementByText(this.cancellationPolicyText);
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  async processCaptcha() {
    await this.inputCaptchaWithRetry({
      captchaSelector: this.loginCaptchaSelector,
      autoCaptcha: this.fetchedPassengerData.AUTOCAPTCHA,
      invalidCaptchalocator: this.invalidCaptchalocatorReview,
    });
  }

  async submitAfterCaptcha() {
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Enter");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }
}
