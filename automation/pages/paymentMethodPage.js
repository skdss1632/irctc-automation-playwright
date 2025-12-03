// pages/PaymentPage.js
import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class PaymentMethod extends BasePage {
  constructor(page) {
    super(page);

    // Wallet Payment Locators
    this.walletPayMethodText = "Text= (Instant Payment)";
    this.safePaymentText = "Safe & Secure Payments";
  }


  async handlePaymentType(upiId) {
    if (!upiId) {
      this.handleWalletPayment();
    }
    // Click Pay and Book button
    await this.page.locator(this.payAndBookButton).click();
  }

  async handleWalletPayment() {
    // Select wallet option
    await this.page.getByAltText(this.walletPayMethodText).click();
  }
}
