const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Collect console logs
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000); // Wait for initial load
  
  // If we see login, fill it
  if (await page.$('#login-email')) {
    await page.fill('#login-email', 'rishi@test.com');
    await page.fill('#login-password', 'test');
    await page.click('#login-submit');
    await page.waitForTimeout(2000);
  }

  // Click game arena button
  const arenaBtn = await page.$('#sidebar-game-arena-btn');
  if (arenaBtn) {
    logs.push('[INFO] Found Game Arena Button, clicking it...');
    await arenaBtn.click();
    await page.waitForTimeout(1000);
  } else {
    logs.push('[ERROR] Sidebar Game Arena Button NOT FOUND in DOM.');
  }

  // Take screenshot
  await page.screenshot({ path: 'debug_screenshot.png' });
  
  console.log("=== BROWSER LOGS ===");
  logs.forEach(l => console.log(l));
  console.log("====================");

  await browser.close();
})();
