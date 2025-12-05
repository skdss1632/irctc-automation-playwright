import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class PaymentPage extends BasePage {
  constructor(page) {
    super(page);

    // UPI Payment Locators
    this.upiMandateRadioButton = this.page.locator(
      'input[type="radio"][value="upiMandate"]'
    );
    this.upiMandateWrapper = this.page.locator("#upiMandate_wrapper");
    this.confirmWalletBtn = this.page.locator(".mob-bot-btn.search_btn");
    this.walletFinalButton = this.page.locator(".train_Search.btnDefault");
    this.upiPayButton = this.page.locator("#autoDebitBtn");
    this.upiInputField = "#mndtVpa";
    // Common Locators
    this.payAndBookButton = ".btn.btn-primary.hidden-xs.ng-star-inserted";

    // verify page locators
    this.mandatePaymentText = "Mandate Based Payment Instruments";
    this.walletBalanceText = "Current IRCTC eWallet Balance";
  }

  async verifyPaymentPage(upiId) {
    if (upiId) {
      await this.verifyLocatorByText(this.mandatePaymentText);
    } else {
      await this.verifyLocatorByText(this.walletBalanceText);
    }
  }

  async handleUPIPayment(upiId) {
    await this.verifyPaymentPage(upiId);
    await this.upiMandateRadioButton.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    const upiInput = this.upiMandateWrapper.locator(this.upiInputField);
    await upiInput.click();
    await upiInput.pressSequentially(upiId, {
      delay: this.sleepMs(
        this.randomDelay(TIMEOUTS.MIN_PRESS_SEQ, TIMEOUTS.MAX_PRESS_SEQ)
      ),
    });
    await this.upiPayButton.click();
  }

  async confirmWalletPayment() {
    await this.confirmWalletBtn.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    // Click final payment button
    // await this.walletFinalButton.click();
  }

  async processPaymentType(upiId) {
    await this.verifyPaymentPage(upiId);
    if (upiId) {
      await this.handleUPIPayment(upiId);
    } else {
      await this.confirmWalletPayment();
    }
  }
}
