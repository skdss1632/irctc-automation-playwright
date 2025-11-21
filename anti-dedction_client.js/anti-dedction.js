import { KameleoLocalApiClient } from "@kameleo/local-api-client";
import playwright from "playwright";

const client = new KameleoLocalApiClient({ basePath: "http://localhost:5050" });
const fps = await client.fingerprint.searchFingerprints(
  "desktop",
  undefined,
  "chrome"
);
const profile = await client.profile.createProfile({
  fingerprintId: fps[0].id,
  name: "playwright auto-start example",
});

const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
const browser = await playwright.chromium.connectOverCDP(browserWSEndpoint);
const context = browser.contexts()[0];
const page = await context.newPage();
await page.goto("https://wikipedia.org");
await new Promise((r) => setTimeout(r, 60000));


await client.profile.stopProfile(profile.id);
