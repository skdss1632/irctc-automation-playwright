import { TIMEOUTS } from "../enums/enums.js";
import { expect } from "@playwright/test";

async function waitUntilTatkalBookingTime(PASSENGER_DATA) {
  // Internal business rules
  let targetHour, targetMinute, targetSecond;

  if (PASSENGER_DATA.TRAIN_COACH === "SL") {
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

    await sleepMs(50);
  }
}

  async function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
  return randint(min, max);
}

  async function autoCaptchaDisabled(autoCaptcha) {
    if (!autoCaptcha) {
      console.log("⚠️ Auto-captcha disabled. Solve manually.");
    }
  }

  
export function validatePassengerData(PASSENGER_DATA) {
  // Train details validation
  if (!PASSENGER_DATA.TRAIN_NO) {
    throw new Error("TRAIN_NO is required and cannot be empty");
  }

  if (!PASSENGER_DATA.TRAIN_COACH || PASSENGER_DATA.TRAIN_COACH.trim() === "") {
    throw new Error("TRAIN_COACH is required and cannot be empty");
  }

  // Stations validation
  if (!PASSENGER_DATA.SOURCE_STATION || PASSENGER_DATA.SOURCE_STATION.trim() === "") {
    throw new Error("SOURCE_STATION is required and cannot be empty");
  }

  if (!PASSENGER_DATA.DESTINATION_STATION || PASSENGER_DATA.DESTINATION_STATION.trim() === "") {
    throw new Error("DESTINATION_STATION is required and cannot be empty");
  }

  // Travel date validation
  if (!PASSENGER_DATA.TRAVEL_DATE || PASSENGER_DATA.TRAVEL_DATE.trim() === "") {
    throw new Error("TRAVEL_DATE is required and cannot be empty");
  }

  // const newDateFormat = convertDateFormat(PASSENGER_DATA.TRAVEL_DATE);
  const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
  
  if (!datePattern.test(PASSENGER_DATA.TRAVEL_DATE)) {
    // console.log(newDateFormat);
    throw new Error("TRAVEL_DATE must be in DD/MM/YYYY format (e.g., 30/11/2025)");
  }

  // Coach validation
  const validCoaches = ["SL", "2A", "3A", "3E", "1A", "CC", "EC", "2S"];
  if (!validCoaches.includes(PASSENGER_DATA.TRAIN_COACH.toUpperCase())) {
    throw new Error(
      `Invalid TRAIN_COACH: "${PASSENGER_DATA.TRAIN_COACH}". Valid options: ${validCoaches.join(", ")}`
    );
  }

  // Tatkal validation
  if (typeof PASSENGER_DATA.TATKAL !== "boolean") {
    throw new Error("TATKAL must be a boolean (true/false)");
  }

  if (typeof PASSENGER_DATA.PREMIUM_TATKAL !== "boolean") {
    throw new Error("PREMIUM_TATKAL must be a boolean (true/false)");
  }

  if (PASSENGER_DATA.TATKAL && PASSENGER_DATA.PREMIUM_TATKAL) {
    throw new Error("Cannot select both TATKAL and PREMIUM_TATKAL. Choose only one.");
  }

  if (PASSENGER_DATA.PREMIUM_TATKAL) {
    const acClasses = ["1A", "2A", "3A", "3E", "CC", "EC"];
    if (!acClasses.includes(PASSENGER_DATA.TRAIN_COACH.toUpperCase())) {
      throw new Error(
        `PREMIUM_TATKAL is only available for AC classes (${acClasses.join(", ")}). Selected: ${PASSENGER_DATA.TRAIN_COACH}`
      );
    }
  }

  // Passenger details validation
  validatePassengers(PASSENGER_DATA.PASSENGER_DETAILS);

  // Station validation
  if (PASSENGER_DATA.SOURCE_STATION === PASSENGER_DATA.DESTINATION_STATION) {
    throw new Error("SOURCE_STATION and DESTINATION_STATION cannot be the same");
  }
}

function validatePassengers(passengerDetails) {
  if (!passengerDetails || !Array.isArray(passengerDetails)) {
    throw new Error("PASSENGER_DETAILS must be an array");
  }

  if (passengerDetails.length === 0) {
    throw new Error("At least one passenger is required in PASSENGER_DETAILS");
  }

  if (passengerDetails.length > 6) {
    throw new Error("Maximum 6 passengers allowed per booking");
  }

  const validSeats = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper", "Window Side", "No Preference"];
  const validGenders = ["Male", "Female", "Transgender"];

  passengerDetails.forEach((passenger, index) => {
    const passengerNum = index + 1;

    // Name validation
    if (!passenger.NAME || passenger.NAME.trim() === "") {
      throw new Error(`Passenger ${passengerNum}: NAME is required and cannot be empty`);
    }

    if (!/^[a-zA-Z\s]+$/.test(passenger.NAME)) {
      throw new Error(`Passenger ${passengerNum}: NAME can only contain letters and spaces`);
    }

    // Age validation
    if (!passenger.AGE && passenger.AGE !== 0) {
      throw new Error(`Passenger ${passengerNum}: AGE is required`);
    }

    if (passenger.AGE < 1 || passenger.AGE > 120) {
      throw new Error(`Passenger ${passengerNum}: AGE must be between 1 and 120 (current: ${passenger.AGE})`);
    }

    // Gender validation
    if (!passenger.GENDER || passenger.GENDER.trim() === "") {
      throw new Error(`Passenger ${passengerNum}: GENDER is required`);
    }

    if (!validGenders.includes(passenger.GENDER)) {
      throw new Error(`Passenger ${passengerNum}: Invalid GENDER "${passenger.GENDER}". Valid options: ${validGenders.join(", ")}`);
    }

    // Seat validation
    if (!passenger.SEAT || passenger.SEAT.trim() === "") {
      throw new Error(`Passenger ${passengerNum}: SEAT preference is required`);
    }

    if (!validSeats.includes(passenger.SEAT)) {
      throw new Error(`Passenger ${passengerNum}: Invalid SEAT "${passenger.SEAT}". Valid options: ${validSeats.join(", ")}`);
    }
  });
}



export {
  waitUntilTatkalBookingTime,
  validatePassengers,
  randomDelay,
  sleepMs,
};
