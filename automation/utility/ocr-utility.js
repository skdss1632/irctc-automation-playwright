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
      return data.extracted_text;
    } else {
      throw new Error("OCR response missing extracted_text field");
    }
  } catch (error) {
    console.error("❌ OCR extraction failed:", error.message);
    throw error;
  }
}

async function solveCaptcha(
  page,
  captchaSelector,
  ocrServerUrl = "http://localhost:5000/extract-text"
) {
  try {    
    // Wait for captcha to load
    const captchaElement = page.getByAltText(captchaSelector);
    await captchaElement.waitFor({ state: 'visible', timeout: 10000 });

    const screenshotBuffer = await captchaElement.screenshot();
    const base64Image = screenshotBuffer.toString("base64");

    // Add data URI prefix
    const fullBase64 = `data:image/png;base64,${base64Image}`;

    // Extract text
    const captchaText = await extractTextFromImage(fullBase64, ocrServerUrl);
    return captchaText;

  } catch (error) {
    console.error(`❌ Failed to solve captcha:`, error.message);
    throw error;
  }
}


async function checkOCRServer(serverUrl = "http://localhost:5000") {
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

export { extractTextFromImage, solveCaptcha, checkOCRServer };
