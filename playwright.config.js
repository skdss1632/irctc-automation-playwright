// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  timeout: 240000, // 60 seconds (override the 30s default)
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: "https://www.irctc.co.in/nget/train-search",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    headless: false,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      // name: "webkit",
      // name: "firefox",
      // use: {
      //   ...devices["Desktop Firefox"],
      //   viewport: { width: 1536, height: 742 },
      // },
      // ...devices["Desktop Safari"],
      // viewport: { width: 1920, height: 1080 },
      // viewport: null,

      // name: "chromium",
      // ...devices["Desktop Chrome"],
      // viewport: { width: 1536, height: 742 },

      // 🛡️ ADD THESE ANTI-DETECTION SETTINGS:
      // userAgent:
      //   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

      // Disable automation flags
      // launchOptions: {
      //   args: [
      //     "--disable-blink-features=AutomationControlled",
      //     "--disable-features=IsolateOrigins,site-per-process",
      //     "--no-sandbox",
      //     "--disable-setuid-sandbox",
      //     "--disable-dev-shm-usage",
      //     "--disable-accelerated-2d-canvas",
      //     "--no-first-run",
      //     "--no-zygote",
    },
  ],
  // },
  // },
  // },

  // ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

