import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.loginButton = this.page.locator("text=LOGIN").first();
    this.usernameInput = "User Name";
    this.passwordInput = "password";
    this.captchaInput = "Enter Captcha";
    this.signInText = "SIGN IN";
    this.logininvalidCaptchaText = "Invalid Captcha....";
    this.captchaLocatorLogin = "Captcha Image here";
    this.BASE_URL = "https://www.irctc.co.in/nget/train-search";
    this.loginPopupText="Login & Booking With OTP"
  }

  async clickLoginButton() {
    await this.loginButton.click();
    await this.verifyElementByText(
      this.loginPopupText,
      VALIDATE_LOCATOR_TIMEOUT.LOGIN_POPUP
    );
  }

  async enterUsername(username) {
    await this.fillInputText(this.usernameInput, username, "placeholder");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  async enterPassword(password) {
    await this.fillInputText(this.passwordInput, password, "placeholder");
    // await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
  }

  async gotoLoginPage() {
    await this.page.goto(this.BASE_URL, { waitUntil: "domcontentloaded" });
    await this.sleepMs(this.randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));
  }

  async closeDialog() {
    await this.page.keyboard.press("Enter");
  }

  async verifyHomePage() {
    await this.verifyElementByText(
      "IRCTC EXCLUSIVE",
      VALIDATE_LOCATOR_TIMEOUT.HOME_PAGE
    );
  }

  async performLogin(username, password) {
    await this.gotoLoginPage();
    await this.closeDialog();
    await this.verifyHomePage();
    await this.clickLoginButton();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.inputCaptchaWithRetry({
      captchaLocator: this.captchaLocatorLogin,
      invalidCaptchaLocatorLogin: this.logininvalidCaptchaText,textLocator:username
    });
    console.log("✅ Login successful");
  }
}
