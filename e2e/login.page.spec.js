const { test, expect } = require("@playwright/test");

test("should validate user login workflow successfully", async ({ page }) => {
  await page.goto("https://www.irctc.co.in/nget/train-search");

  const alertDialog = page.getByRole("dialog", { name: "Alert" });
  await alertDialog.getByRole("button", { name: /press ok to confirm/i }).click();



  // await page.getByRole("button", { name: "OK" }).click();


  // precise login button..
  await page.getByRole("link", { name: /click here to login/i }).click();

  // await page.fill("#username", "");
  // await page.fill("#password", "");
});
