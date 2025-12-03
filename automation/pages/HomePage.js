import { BasePage } from "./BasePage.js";
import { TIMEOUTS, VALIDATE_LOCATOR_TIMEOUT } from "../enums/enums.js";

export class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.fromStationInput =
      "//input[contains(@aria-label, 'Enter From station')]";
    this.toStationInput = "//input[contains(@aria-label, 'Enter To station')]";
    this.dateInput = "#jDate";
    this.quotaDropdown = "#journeyQuota";
    this.tatkalOption = "//li[contains(@aria-label, 'TATKAL')]";
    this.premiumTatkalOption = "//li[contains(@aria-label, 'PREMIUM TATKAL')]";
  }


  async enterFromStation(station) {
    await this.fillInputText(this.fromStationInput, station);
    await this.sleepMs(
      this.randomDelay(
        TIMEOUTS.MIN_TRAIN_SEARCH_WAIT,
        TIMEOUTS.MAX_TRAIN_SEARCH_WAIT
      )
    );
    await this.page.keyboard.press("Enter");
    await this.sleepMs(this.randomDelay(TIMEOUTS.SHORT, TIMEOUTS.SHORT));
  }

  async enterToStation(station) {
    await this.fillInputText(this.toStationInput, station);
    await this.sleepMs(
      this.randomDelay(
        TIMEOUTS.MIN_TRAIN_SEARCH_WAIT,
        TIMEOUTS.MAX_TRAIN_SEARCH_WAIT
      )
    );
    await this.page.keyboard.press("Enter");
    await this.sleepMs(this.randomDelay(TIMEOUTS.SHORT, TIMEOUTS.SHORT));
  }

  async selectTicketType(isTatkal, isPremiumTatkal) {
    if (isTatkal || isPremiumTatkal) {
      await this.hoverAndClick(this.quotaDropdown);
      await this.sleepMs(this.randomDelay(TIMEOUTS.SHORT, TIMEOUTS.SHORT));
      const ticketType = isTatkal
        ? this.tatkalOption
        : this.premiumTatkalOption;
      await this.hoverAndClick(ticketType);
      await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
    }
  }

  async enterTravelDate(date) {
    // const newDateFormat = convertDateFormat(date);
    await this.fillInputText(this.dateInput, date);
    await this.sleepMs(
      this.randomDelay(
        TIMEOUTS.MIN_TRAIN_SEARCH_WAIT,
        TIMEOUTS.MAX_TRAIN_SEARCH_WAIT
      )
    );
    await this.page.keyboard.press("Enter");
    await this.sleepMs(
      this.randomDelay(
        TIMEOUTS.MIN_TRAIN_SEARCH_WAIT,
        TIMEOUTS.MAX_TRAIN_SEARCH_WAIT
      )
    );
  }

  async searchTrain(
    fromStation,
    toStation,
    travelDate,
    isTatkal,
    isPremiumTatkal
  ) {
    await this.enterFromStation(fromStation);
    await this.enterToStation(toStation);
    await this.selectTicketType(isTatkal, isPremiumTatkal);
    await this.enterTravelDate(travelDate);
    console.log("✅ Train search completed successfully");
  }
}
