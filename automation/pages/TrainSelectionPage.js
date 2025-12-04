import { BasePage } from "./BasePage.js";
import { TIMEOUTS } from "../enums/enums.js";

export class TrainSelectionPage extends BasePage {
  constructor(page) {
    super(page);

    // widgets
    this.trainWidgetsSelector =
      ".form-group.no-pad.col-xs-12.bull-back.border-all";
    this.coachTypeWidgetLocator = ".white-back.col-xs-12.ng-star-inserted";
    this.bookingDateWidgetSelector = ".col-xs-12.ng-star-inserted";

    //locators
    this.seatElementsSelector = ".pre-avl";
    this.bookNowButton = "text=Book Now";
    this.bookingDateLink = ".link.ng-star-inserted";
    this.verifyPage = "Show Available Trains";
  }

  async selectCoachType(trainCoach, coachTypeWidget) {
    const seatElements = await coachTypeWidget
      .locator(this.seatElementsSelector)
      .all();

    for (const element of seatElements) {
      const text = await element.textContent();
      const cleanText = text.split("Refresh")[0].trim();

      if (cleanText.toLowerCase().includes(trainCoach.toLowerCase())) {
        console.log(`Matched! Clicking on: ${cleanText}`);
        await element.click();
        return true;
      }
    }

    console.log(`No seat type found matching: ${trainCoach}`);
    return false;
  }

  async clickBookingDateWithRetry(
    bookingDateWidget,
    trainCoach,
    isTatkal,
    isPremiumTatkal
  ) {
    const label = isTatkal || isPremiumTatkal ? "AVAILABLE" : "WL";

    await this.verifyElementInWidget(bookingDateWidget, label, 60000);

    const bookingDate = bookingDateWidget.locator(this.bookingDateLink).first();

    try {
      await bookingDate.click();
    } catch {
      console.log("Unable to click on booking date, trying again...");

      const coachLocator = bookingDateWidget.locator(`text=${trainCoach}`);
      const coachText = await coachLocator.textContent();

      if (coachText && coachText.includes(trainCoach)) {
        await coachLocator.click();
      }

      await this.verifyElementInWidget(bookingDateWidget, label);
      await bookingDate.click();
    }
  }

  async pickTrain(trainNumber, trainCoach, isTatkal, isPremiumTatkal) {
    await this.verifyLocatorByText(this.verifyPage);
    const trainWidgets = this.page.locator(this.trainWidgetsSelector);
    const count = await trainWidgets.count();

    for (let i = 0; i < count; i++) {
      const widget = trainWidgets.nth(i);
      const content = await widget.textContent();

      if (!content || !content.includes(trainNumber)) continue;

      const coachTypeWidget = widget.locator(this.coachTypeWidgetLocator);
      const coachSelected = await this.selectCoachType(
        trainCoach,
        coachTypeWidget
      );

      if (!coachSelected) continue;

      const bookingDateWidget = widget.locator(this.bookingDateWidgetSelector);
      await this.clickBookingDateWithRetry(
        bookingDateWidget,
        trainCoach,
        isTatkal,
        isPremiumTatkal
      );
      await this.sleepMs(this.randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));

      await widget.locator(this.bookNowButton).click();
      console.log("✅ Clicked on Book Now button");

      return true;
    }

    return false;
  }
}
