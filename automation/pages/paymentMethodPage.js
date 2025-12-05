import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class PaymentMethodPage extends BasePage {
  constructor(page) {
    super(page);

    // Wallet Payment Locators
    this.walletPayMethodText = this.page.getByAltText("Rail Icon");
    this.payAndBookButton = this.page.locator(
      ".btn.btn-primary.hidden-xs.ng-star-inserted"
    );
  }

  async handlePaymentMethod(upiId) {
    if (!upiId) {
      await this.walletPayMethodText.click();
    }
    await this.payAndBookButton.click();
    // no need to wait here as next page will auto wait upto 60 seconds to verify payment page
  }
}
