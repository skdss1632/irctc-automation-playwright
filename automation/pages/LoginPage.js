import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";
import dotenv from "dotenv";
dotenv.config();

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.loginButton = this.page.getByText("LOGIN");
    this.usernameInput = "User Name";
    this.passwordInput = "password";
    this.captchaInput = "Enter Captcha";
    this.signInText = "SIGN IN";
    this.logininvalidCaptchaText = "Invalid Captcha....";
    this.captchaLocatorLogin = "Captcha Image here";
    this.BASE_URL = process.env.WEB_BASE_URL;
    this.loginPopupText = "Login & Booking With OTP";
    this.exclusiveText = "IRCTC EXCLUSIVE";
    this.loginText = "LOGIN";
    this.verifyLoginText = "Welcome";
  }

  async clickLoginButton() {
    await this.loginButton.first().click();
    await this.verifyLocatorByText(
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
    await this.verifyLocatorByText(
      this.exclusiveText,
      VALIDATE_LOCATOR_TIMEOUT.HOME_PAGE
    );
  }

  async processCaptcha() {
    await this.inputCaptchaWithRetry({
      captchaInput: this.captchaInput,
      captchaLocator: this.captchaLocatorLogin,
      invalidCaptchaLocatorLogin: this.logininvalidCaptchaText,
      textLocator: this.verifyLoginText,
      timeout: VALIDATE_LOCATOR_TIMEOUT.USER_NAME,
    });
  }

  async performLogin(username, password) {
    await this.gotoLoginPage();
    await this.closeDialog();
    await this.verifyHomePage();
    await this.clickLoginButton();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.processCaptcha();
    console.log("✅ Login successful");
  }
}
