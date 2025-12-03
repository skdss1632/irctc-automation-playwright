import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class PaymentPage extends BasePage {
  constructor(page) {
    super(page);

    // Common Locators
    this.payAndBookButton = ".btn.btn-primary.hidden-xs.ng-star-inserted";

    // UPI Payment Locators
    this.upiMandateRadioButton = 'input[type="radio"][value="upiMandate"]';
    this.upiMandateWrapper = "#upiMandate_wrapper";
    this.upiInputField = "#mndtVpa";
    this.upiPayButton = "#autoDebitBtn";

    this.walletConfirmButton = ".mob-bot-btn.search_btn";
    this.walletFinalButton = ".train_Search.btnDefault";

    // verify page locators
    this.mandatePaymentText = "Mandate Based Payment Instruments";
    this.walletBalanceText = "Current IRCTC eWallet Balance";
  }

  async processPaymentType(upiId = null) {
    // Verify payment page
    await this.verifyPaymentPage(upiId);

    // Choose payment method
    if (upiId) {
      await this.handleUPIPayment(upiId);
    } else {
      await this.confirmWalletPayment(confirmWallet);
    }
    await this.sleepMs(this.randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));
  }

  async verifyPaymentPage(upiId) {
    if (upiId) {
      await this.verifyElementByText(this.mandatePaymentText);
    }
    await this.verifyElementByText(this.walletBalanceText);
  }

  async handleUPIPayment(upiId) {
    this.verifyPaymentPage(upiId);

    // Select UPI mandate radio button
    await this.page.locator(this.upiMandateRadioButton).check();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    // Fill UPI ID
    const widget = this.page.locator(this.upiMandateWrapper);
    const upiInput = widget.locator(this.upiInputField);
    await upiInput.click();

    await upiInput.pressSequentially(upiId, {
      delay: this.randomDelay(
        TIMEOUTS.MIN_PRESS_SEQ_WAIT,
        TIMEOUTS.MAX_PRESS_SEQ_WAIT
      ),
    });

    // Click Pay button
    await this.page.locator(this.upiPayButton).click();
  }

  async confirmWalletPayment() {
    // Click confirm button
    const confirmBtn = await this.page.locator(this.walletConfirmButton);
    await confirmBtn.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    // Click final payment button
    // await this.page.locator(this.walletFinalButton).click();
  }
}
