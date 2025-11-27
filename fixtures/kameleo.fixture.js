const { test: base } = require("@playwright/test");
const { KameleoLocalApiClient } = require("@kameleo/local-api-client");
const playwright = require("playwright");

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
      name: `test-profile-${Date.now()}`,
    });

    const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
    const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
    const context = browser.contexts()[0];

    await use(context);

    await client.profile.stopProfile(profile.id);
  },
});

exports.expect = require("@playwright/test").expect;
