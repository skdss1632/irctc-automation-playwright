
import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";

export class ReviewPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.captchaInput = "Enter Captcha";
    this.invalidCaptchaLocatorReview = "Invalid Captcha";
    this.cancellationPolicyText = "View Cancellation Policy";
    this.captchaLocatorReview= "Captcha Image here";
    this.safePaymentText = "Safe & Secure Payments";
  }

  async verifyJourneyReviewPage() {
    await this.verifyLocatorByText(this.cancellationPolicyText);
  }

  async processCaptcha() {
    await this.inputCaptchaWithRetry({
      captchaLocator: this.captchaLocatorReview,
      invalidCaptchaLocator: this.invalidCaptchaLocatorReview,textLocator: this.safePaymentText,timeout:VALIDATE_LOCATOR_TIMEOUT.DEFAULT
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

  async processReviewJourneyPage(){
    await this.verifyJourneyReviewPage();
    await this.processCaptcha();
    await this.submitAfterCaptcha();
  }
}
