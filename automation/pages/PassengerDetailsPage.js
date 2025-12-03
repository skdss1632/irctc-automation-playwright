// pages/PassengerDetailsPage.js
import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";
import { expect } from "@playwright/test";

export class PassengerDetailsPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.nameInputSelector = "Name";
    this.ageInputSelector = "Age";
    this.genderDropdownSelector = "select[formcontrolname='passengerGender']";
    this.seatDropdownSelector =
      "select[formcontrolname='passengerBerthChoice']";
    this.addPassengerButton = "text=+ Add Passenger";
    this.autoUpgradeCheckbox = "text=Consider for Auto Upgradation";
    this.doNotWantFood = "I don't want Food/Beverages";
    this.continueButton = "text=Continue";
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
    const nameFld = this.page
      .getByPlaceholder(this.nameInputSelector)
      .nth(index);
    await nameFld.click();
    await this.pressSequentially(nameFld, passenger.NAME);

    // Age
    const ageFld = this.page.getByPlaceholder(this.ageInputSelector).nth(index);
    await ageFld.click();
    await this.pressSequentially(ageFld, passenger.AGE.toString());

    // Gender
    const genderDropdown = this.page
      .locator(this.genderDropdownSelector)
      .nth(index);
    await genderDropdown.click();
    await genderDropdown.selectOption(passenger.GENDER);

    // Seat
    const seatDropdown = this.page
      .locator(this.seatDropdownSelector)
      .nth(index);
    await seatDropdown.click();
    await seatDropdown.selectOption(passenger.SEAT);
  }

  async addNextPassengerForm(currentIndex) {
    await this.page.locator(this.addPassengerButton).click();
    const locator = this.page.getByPlaceholder(this.nameInputSelector).nth(currentIndex+1);
    await expect(locator).toBeVisible({ timeout:VALIDATE_LOCATOR_TIMEOUT.PASSENGER_FROM });
    await expect(locator).toBeAttached({ timeout:VALIDATE_LOCATOR_TIMEOUT.PASSENGER_FROM }); 
  }

  async submitPassengerDetails() {
    await this.page.locator(this.autoUpgradeCheckbox).click();
    await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

    const continueBtn = this.page.locator(this.continueButton).first();
    await continueBtn.click();
  }

  async handlePassengerInput(passengerDetails) {
    await this.verifyElementByText("+ Add Passenger");
    await this.fillPassengerDetails(passengerDetails);
    await this.submitPassengerDetails();
  }
}
