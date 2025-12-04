import dotenv from "dotenv";
dotenv.config();

if (!process.env.BASE_URL) {
  console.error('❌ BASE_URL not found in .env file');
  throw new Error('BASE_URL environment variable is required');
}
console.log('✅ Loaded BASE_URL:', process.env.BASE_URL);


export async function extractTextFromImage(
  base64ImageScreenshot,
  ocrServerUrl  
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


export async function solveCaptcha(
  page,
  captchaSelector,
  ocrServerUrl = `${process.env.BASE_URL}/extract-text` 
) {
  try {
    const captchaElement = page.getByAltText(captchaSelector);

    const screenshotBuffer = await captchaElement.screenshot();
    const base64Image = screenshotBuffer.toString("base64");

    const fullBase64 = `data:image/png;base64,${base64Image}`;

    console.log('🔤 Sending to OCR server...');
    const captchaText = await extractTextFromImage(fullBase64, ocrServerUrl);

    console.log(`✅ OCR result: "${captchaText}"`);
    return captchaText.trim();

  } catch (error) {
    console.error(`❌ Failed to solve captcha:`, error.message);
    throw error;
  }
}


export async function checkOCRServer(serverUrl = process.env.BASE_URL) {
  try {
    const controller = new AbortController();

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
