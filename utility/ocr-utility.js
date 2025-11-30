// utility/ocr.utility.js

import { TIMEOUTS } from "../enums/enums";
import { sleepMs, randomDelay } from "./utility";

/**
 * Send image to OCR server and get extracted text using fetch
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} ocrServerUrl - OCR server endpoint
 * @returns {Promise<string>} Extracted text from image
 */
async function extractTextFromImage(
  base64ImageScreenshot,
  ocrServerUrl = "http://localhost:5000/extract-text"
) {
  try {
    const response = await fetch(ocrServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64ImageScreenshot,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OCR Server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data && data.extracted_text) {
      console.log("✓ OCR extracted text:", data.extracted_text);
      return data.extracted_text;
    } else {
      throw new Error("No text extracted from OCR response");
    }
  } catch (error) {
    console.error("❌ OCR extraction failed:", error.message);
    throw error;
  }
}

/**
 * Capture CAPTCHA image from page and extract text via OCR
 * @param {Page} page - Playwright page object
 * @param {string} captchaSelector - CSS selector for CAPTCHA image
 * @param {string} ocrServerUrl - OCR server endpoint
 * @returns {Promise<string>} Extracted CAPTCHA text
 */
async function solveCaptcha(
  page,
  captchaSelector,
  ocrServerUrl = "http://localhost:5000/extract-text"
) {
  const MAX_ATTEMPTS = 6;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`\n🔄 CAPTCHA OCR Attempt ${attempt}/${MAX_ATTEMPTS}`);
      console.log("🔍 Looking for CAPTCHA image...");

      await page.getByAltText(captchaSelector);
      console.log("📸 Capturing CAPTCHA screenshot...");

      const captchaElement = page.getByAltText(captchaSelector);

      // Get as Buffer, then convert
      const screenshotBuffer = await captchaElement.screenshot();
      const base64Image = screenshotBuffer.toString("base64");

      // Add data URI prefix
      const fullBase64 = `data:image/png;base64,${base64Image}`;

      console.log("🤖 Sending to OCR server...");
      const captchaText = await extractTextFromImage(fullBase64, ocrServerUrl);

      if (!captchaText || captchaText.trim() === "") {
        throw new Error("OCR returned empty text");
      }

      console.log(`✅ Solved CAPTCHA: ${captchaText} (attempt ${attempt})`);
      return captchaText; // Success - return immediately
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);

      if (attempt === MAX_ATTEMPTS) {
        console.error(`\n💥 All ${MAX_ATTEMPTS} attempts exhausted`);
        throw new Error(
          `CAPTCHA solving failed after ${MAX_ATTEMPTS} attempts: ${error.message}`
        );
      }

      console.log(`⏳ Retrying in 1 second...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Check if OCR server is running
 * @param {string} serverUrl - OCR server base URL
 * @returns {Promise<boolean>} True if server is reachable
 */
async function checkOCRServer(serverUrl = "http://localhost:5000") {
  try {
    const response = await fetch(serverUrl, {
      method: "GET",
      timeout: 5000,
    });

    if (response.ok) {
      console.log("✅ OCR server is running");
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ OCR server is not reachable:", error.message);
    return false;
  }
}

module.exports = {
  extractTextFromImage,
  solveCaptcha,
  checkOCRServer,
};
