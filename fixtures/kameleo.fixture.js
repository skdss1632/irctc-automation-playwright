import { test as base } from "@playwright/test";
import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

exports.test = base.extend({
  kameleoContext: async ({}, use) => {

    const client = new KameleoLocalApiClient({
      basePath: "http://localhost:5050",
    });

    const fingerprints = await client.fingerprint.searchFingerprints(
      "desktop",
      undefined,
      "chrome"
    );

    const profile = await client.profile.createProfile({
      fingerprintId: fingerprints[0].id,
      name: `irctc-test-${Date.now()}`,
    });

    const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
    const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
    const context = browser.contexts()[0];

      await context.grantPermissions([], {
        origin: "https://www.irctc.co.in",
      });

    await use(context);
    await client.profile.stopProfile(profile.id);
  },

  //Auto-maximized page fixture
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

exports.expect = require("@playwright/test").expect;
