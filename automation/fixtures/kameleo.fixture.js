// fixtures/kameleo.fixture.js
import { test as base, expect } from "@playwright/test";
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

const KAMELEO_TIMEOUT = 120000; // 2 minutes
const PROFILE_NAME_PREFIX = "DM86";

export const test = base.extend({
  kameleoContext: async ({}, use) => {
    let client;
    let profile;
    let browser;

    try {
      console.log("🔧 Setting up Kameleo...");

      // Initialize client with timeout
      client = new KameleoLocalApiClient({
        basePath: "http://localhost:5050",
        timeout: KAMELEO_TIMEOUT, // ⭐ Add timeout
      });

      console.log("🔍 Searching for fingerprints...");
      const fingerprints = await client.fingerprint.searchFingerprints(
        "desktop",
        undefined,
        "chrome"
      );

      if (!fingerprints || fingerprints.length === 0) {
        throw new Error("No fingerprints found");
      }

      console.log(`✓ Found ${fingerprints.length} fingerprints`);

      // Create profile
      profile = await client.profile.createProfile({
        fingerprintId: fingerprints[0].id,
        name: `${PROFILE_NAME_PREFIX}-${Date.now()}`,
      });
      console.log(`✓ Profile created: ${profile.id}`);

      // ⭐ Start profile with retry logic
      console.log("⏳ Starting profile (may take up to 2 minutes)...");
      await startProfileWithRetry(client, profile.id, 3);
      console.log("✓ Profile started");

      // Wait for profile to be fully ready
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Connect browser
      const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
      console.log(`🌐 Connecting to: ${browserWSEndpoint}`);
      
      browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
      const context = browser.contexts()[0];
      console.log("✓ Browser connected");

      await context.grantPermissions([], {
        origin: "https://www.irctc.co.in",
      });
      console.log("✓ Permissions granted");

      await use(context);

    } catch (error) {
      console.error("❌ Kameleo setup failed:", error.message);
      throw error;
    } finally {
      console.log("🧹 Cleaning up...");
      
      if (browser) {
        try {
          await browser.close();
          console.log("✓ Browser closed");
        } catch (err) {
          console.error("⚠️ Browser close failed:", err.message);
        }
      }

      if (profile && client) {
        try {
          await client.profile.stopProfile(profile.id);
          console.log("✓ Profile stopped");
        } catch (err) {
          console.error("⚠️ Profile stop failed (expected if not started)");
        }
      }
    }
  },

  page: async ({ kameleoContext }, use) => {
    const page = await kameleoContext.newPage();

    try {
      const cdp = await kameleoContext.newCDPSession(page);
      const { windowId } = await cdp.send("Browser.getWindowForTarget");
      await cdp.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "maximized" },
      });
      console.log("✓ Window maximized");
    } catch (error) {
      console.log("⚠️ Maximize failed:", error.message);
    }

    await use(page);
  },
});

// ⭐ Helper function with retry logic
async function startProfileWithRetry(client, profileId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} to start profile...`);
      await client.profile.startProfile(profileId);
      return; // Success
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to start profile after ${maxRetries} attempts: ${error.message}`);
      }
      
      console.log(`⏳ Waiting 5 seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

export { expect };
