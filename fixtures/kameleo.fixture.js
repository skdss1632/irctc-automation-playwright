import { test as base, expect } from "@playwright/test";
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

// ✅ Define a persistent profile name
const PROFILE_NAME = "gb2";

export const test = base.extend({
  kameleoContext: async ({}, use) => {
    const client = new KameleoLocalApiClient({
      basePath: "http://localhost:5050",
    });

    let profile;

    // ✅ Check if profile already exists
    const profiles = await client.profile.listProfiles();
    const existingProfile = profiles.find((p) => p.name === PROFILE_NAME);

    if (existingProfile) {
      console.log(`✓ Reusing existing profile: ${PROFILE_NAME}`);
      profile = existingProfile;

      // Start the profile if it's not already running
      try {
        await client.profile.startProfile(profile.id);
      } catch (error) {
        // Profile might already be running
        console.log("Profile already running or starting...");
      }
    } else {
      // ✅ Create new profile only if it doesn't exist
      console.log(`✓ Creating new profile: ${PROFILE_NAME}`);
      const fingerprints = await client.fingerprint.searchFingerprints(
        "desktop",
        undefined,
        "chrome"
      );

      profile = await client.profile.createProfile({
        fingerprintId: fingerprints[0].id,
        name: PROFILE_NAME,
        // Optional: Add more persistent settings
        canvas: "noise",
        webgl: "noise",
      });
    }

    const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
    const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
    const context = browser.contexts()[0];

    await context.grantPermissions([], {
      origin: "https://www.irctc.co.in",
    });

    await use(context);

    // ✅ DON'T stop the profile - keep it running for next time
    // await client.profile.stopProfile(profile.id);
    console.log("✓ Profile kept alive for next run");
  },

  // Auto-maximized page fixture
  page: async ({ kameleoContext }, use) => {
    const page = await kameleoContext.newPage();

    // Maximize window
    try {
      const cdp = await kameleoContext.newCDPSession(page);
      const { windowId } = await cdp.send("Browser.getWindowForTarget");
      await cdp.send("Browser.setWindowBounds", {
        windowId,
        bounds: { windowState: "maximized" },
      });
      console.log("✓ Browser window maximized");
    } catch (error) {
      console.log("⚠️ Maximize failed");
    }

    await use(page);
  },
});

export { expect };
