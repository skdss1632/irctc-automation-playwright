
import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class PaymentMethod extends BasePage {
  constructor(page) {
    super(page);

    // Wallet Payment Locators
    this.walletPayMethodText = this.page.getByAltText("Rail Icon");
    this.payAndBookButton = this.page.locator(
      ".btn.btn-primary.hidden-xs.ng-star-inserted"
    );
  }

  async handlePaymentType(upiId) {
    if (!upiId) {
      await this.walletPayMethodText.click();
    }
    // Click Pay and Book button
    await this.payAndBookButton.click();
  }
}
