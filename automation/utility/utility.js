import { TIMEOUTS } from "../enums/enums.js";
import { expect } from "@playwright/test";

const sleepMsAndPressSeq = async (element, inputText) => {
  await sleepMs(randomDelay(TIMEOUTS.VERY_SHORT, TIMEOUTS.SHORT));
  await element.pressSequentially(inputText, {
    delay: randomDelay(
      TIMEOUTS.MIN_PRESS_SEQ_WAIT,
      TIMEOUTS.MAX_PRESS_SEQ_WAIT
    ),
  });
};

async function waitUntilTatkalBookingTime(FETCHED_PASSENGER_DATA) {
  // Internal business rules
  let targetHour, targetMinute, targetSecond;

  if (FETCHED_PASSENGER_DATA.TRAIN_COACH === "SL") {
    targetHour = 10;
    targetMinute = 0;
    targetSecond = 2;
  } else {
    targetHour = 11;
    targetMinute = 0;
    targetSecond = 2;
  }

  while (true) {
    const now = new Date();

    if (
      now.getHours() === targetHour &&
      now.getMinutes() === targetMinute &&
      now.getSeconds() >= targetSecond
    ) {
      console.log("🚀 Exact time reached!");
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

 function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  }

  async function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return randint(min, max);
}

export {
  waitUntilTatkalBookingTime,
  convertDateFormat,
  sleepMsAndPressSeq,
  randomDelay,
  sleepMs,
};
