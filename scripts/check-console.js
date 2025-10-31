const { chromium } = require('playwright');

// Simple smoke test: open the app, capture console messages and page errors.
// Exits with code 0 if no console errors of level "error" and no pageerror; else exits 1.

const URL = process.env.URL || 'http://localhost:5173/';
const TIMEOUT = 20000;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push({ type, text });
      console.error('[console.error]', text);
    } else {
      console.log('[console.' + type + ']', text);
    }
  });

  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', text: err.message });
    console.error('[pageerror]', err.message);
  });

  // Wait-for-server helper
  const waitForServer = async () => {
    const max = Date.now() + TIMEOUT;
    while (Date.now() < max) {
      try {
        const r = await page.goto(URL, { timeout: 3000 });
        if (r && r.status() < 400) return true;
      } catch (e) {
        // ignore and retry
      }
      await new Promise(res => setTimeout(res, 500));
    }
    return false;
  };

  const up = await waitForServer();
  if (!up) {
    console.error(`Unable to reach ${URL} within ${TIMEOUT}ms`);
    await browser.close();
    process.exit(2);
  }

  // Give the page a moment to do client-side rendering and emit console messages
  await page.waitForTimeout(1500);

  await browser.close();

  if (errors.length > 0) {
    console.error(`Found ${errors.length} console error(s)`);
    process.exit(1);
  }

  console.log('No console errors found. Smoke test passed.');
  process.exit(0);
})();
