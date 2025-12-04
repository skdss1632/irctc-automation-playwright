import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";
import { expect } from "@playwright/test";

export class PassengerDetailsPage extends BasePage {
  constructor(page) {
    super(page);

    // Initialize locators directly
    this.nameInputLocator = this.page.getByPlaceholder("Name");
    this.ageInputLocator = this.page.getByPlaceholder("Age");
    this.genderDropdownLocator = this.page.locator(
      "select[formcontrolname='passengerGender']"
    );
    this.seatDropdownLocator = this.page.locator(
      "select[formcontrolname='passengerBerthChoice']"
    );
    this.addPassengerButtonLocator = this.page.locator("text=+ Add Passenger");
    this.autoUpgradeCheckboxLocator = this.page.locator(
      "text=Consider for Auto Upgradation"
    );
    this.continueButtonLocator = this.page.locator("text=Continue");
  }

  async fillPassengerDetails(passengerDetails) {
    for (let i = 0; i < passengerDetails.length; i++) {
      await this.fillSinglePassenger(passengerDetails[i], i);

      if (i < passengerDetails.length - 1) {
        await this.addNextPassengerForm(i);
      }
    }

    console.log("✅ Passenger details filled successfully");
  }

  async fillSinglePassenger(passenger, index) {
    // Name
    const nameFld = this.nameInputLocator.nth(index);
    await nameFld.click();
    await this.pressSequentially(nameFld, passenger.NAME);

    // Age
    const ageFld = this.ageInputLocator.nth(index);
    await ageFld.click();
    await this.pressSequentially(ageFld, passenger.AGE.toString());

    // Gender
    const genderDropdown = this.genderDropdownLocator.nth(index);
    await genderDropdown.click();
    await genderDropdown.selectOption(passenger.GENDER);

    // Seat
    const seatDropdown = this.seatDropdownLocator.nth(index);
    await seatDropdown.click();
    await seatDropdown.selectOption(passenger.SEAT);
  }

  async addNextPassengerForm(currentIndex) {
    await this.addPassengerButtonLocator.click();
    const locator = this.nameInputLocator.nth(currentIndex + 1);
    await expect(locator).toBeVisible({
      timeout: VALIDATE_LOCATOR_TIMEOUT.PASSENGER_FORM,
    });
    await expect(locator).toBeAttached({
      timeout: VALIDATE_LOCATOR_TIMEOUT.PASSENGER_FORM,
    });
  }

  async submitPassengerDetails() {
    await this.autoUpgradeCheckboxLocator.click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    const continueBtn = this.continueButtonLocator.first();
    await continueBtn.click();
  }

  async handlePassengerInput(passengerDetails) {
    await this.verifyLocatorByText("+ Add Passenger");
    await this.fillPassengerDetails(passengerDetails);
    await this.submitPassengerDetails();
  }
}
