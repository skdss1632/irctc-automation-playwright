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
    this.captchaLocator = "Captcha Image here";
    this.BASE_URL = "https://www.irctc.co.in/nget/train-search";
  }

  async clickLoginButton() {
    await this.loginButton.click();
    await this.verifyElementByText(
      this.signInText,
      VALIDATE_LOCATOR_TIMEOUT.SIGN_IN_BTN
    );
  }

  async enterUsername(username) {
    await this.fillInputText(this.usernameInput, username, "placeholder");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  }

  async enterPassword(password) {
    await this.fillInputText(this.passwordInput, password, "placeholder");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
  }

  async submitLogin() {
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Tab");
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    await this.page.keyboard.press("Enter");
  }

  async gotoLoginPage() {
    await this.page.goto(this.BASE_URL, { waitUntil: "domcontentloaded" });
    await this.sleepMs(this.randomDelay(TIMEOUTS.MEDIUM, TIMEOUTS.LONG));
  }

  async closeDialog() {
    await this.page.keyboard.press("Enter");
    await this.sleepMs(this.randomDelay(TIMEOUTS.SHORT, TIMEOUTS.SHORT));
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
      captchaLocator: this.captchaLocator,
      invalidCaptchalocator: this.logininvalidCaptchaText,
    });
    await this.submitLogin();
    await this.verifyElementByText(username);
    console.log("✅ Login successful");
  }
}
