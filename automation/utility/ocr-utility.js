// utility/ocr-utility.js

/**
 * Extract text from base64 image using OCR server
 */
export async function extractTextFromImage(
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
      return data.extracted_text;
    } else {
      throw new Error("OCR response missing extracted_text field");
    }
  } catch (error) {
    console.error("❌ OCR extraction failed:", error.message);
    throw error;
  }
}

/**
 * Solve captcha using OCR
 */
export async function solveCaptcha(
  page,
  captchaSelector,
  ocrServerUrl = "http://localhost:5000/extract-text"
) {
  try {
    console.log(`🔍 Looking for captcha: "${captchaSelector}"`);
    
    const captchaElement = page.getByAltText(captchaSelector);
    await captchaElement.waitFor({ state: 'visible', timeout: 10000 });

    console.log('📸 Taking captcha screenshot...');
    const screenshotBuffer = await captchaElement.screenshot();
    const base64Image = screenshotBuffer.toString("base64");

    const fullBase64 = `data:image/png;base64,${base64Image}`;

    console.log('🔤 Sending to OCR server...');
    const captchaText = await extractTextFromImage(fullBase64, ocrServerUrl);

    if (!captchaText || captchaText.trim() === "") {
      throw new Error("OCR returned empty text");
    }

    console.log(`✅ OCR result: "${captchaText}"`);
    return captchaText.trim();

  } catch (error) {
    console.error(`❌ Failed to solve captcha:`, error.message);
    throw error;
  }
}

/**
 * Check if OCR server is running
 */
export async function checkOCRServer(serverUrl = "http://localhost:5000") {
  try {
    console.log('🔍 Checking OCR server...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(serverUrl, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      console.log("✅ OCR server is running");
      return true;
    }
    
    console.warn(`⚠️ OCR server returned status: ${response.status}`);
    return false;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("❌ OCR server connection timeout");
    } else {
      console.error("❌ OCR server is not reachable:", error.message);
    }
    return false;
  }
}
