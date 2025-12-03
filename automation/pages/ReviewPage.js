// pages/CaptchaPage.js
import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class ReviewPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.captchaInput = "Enter Captcha";
    this.invalidCaptchalocatorReview = "Invalid Captcha";
    this.cancellationPolicyText = "View Cancellation Policy";
    this.captchaLocatorReview= "Captcha Image here";
    this.safePaymentText = "Safe & Secure Payments";
  }

  async verifyJourneyReviewPage() {
    await this.verifyElementByText(this.cancellationPolicyText);
  }

  async processCaptcha(passengerData) {
    await this.inputCaptchaWithRetry({
      captchaSelector: this.captchaLocatorReview,
      autoCaptcha: passengerData.AUTO_CAPTCHA,
      invalidCaptchalocator: this.invalidCaptchalocatorReview,textLocator: safePaymentText,
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

  async processReviewJourneyPage(passengerData){
    await this.verifyJourneyReviewPage();
    await this.processCaptcha(passengerData);
    await this.submitAfterCaptcha();
  }
}
