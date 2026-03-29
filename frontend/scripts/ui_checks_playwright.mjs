import { chromium } from 'playwright';

const BASE_URL = 'https://slotify-iota.vercel.app';

const results = [];

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const checkPage = async (path) => {
    try {
      const res = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 60000 });
      record(`Open ${path}`, !!res && res.ok(), `status=${res?.status()}`);
    } catch (err) {
      record(`Open ${path}`, false, String(err));
    }
  };

  await checkPage('/event-types');

  try {
    const themeBtn = page.locator('button[title*="Switch to"], button[aria-label*="Switch to"]');
    await themeBtn.first().click({ timeout: 10000 });
    record('Theme toggle click (dashboard)', true);
  } catch (err) {
    record('Theme toggle click (dashboard)', false, String(err));
  }

  try {
    const sidebarBtn = page.locator('button[title="Collapse sidebar"], button[title="Expand sidebar"]');
    await sidebarBtn.first().click({ timeout: 10000 });
    await sidebarBtn.first().click({ timeout: 10000 });
    record('Sidebar toggle click', true);
  } catch (err) {
    record('Sidebar toggle click', false, String(err));
  }

  for (const nav of ['/meetings', '/availability', '/event-types']) {
    await checkPage(nav);
  }

  let bookingSlug = 'demo';
  try {
    const apiRes = await page.request.get(`${BASE_URL}/api/event-types`);
    if (apiRes.ok()) {
      const payload = await apiRes.json();
      if (Array.isArray(payload) && payload.length > 0 && payload[0].slug) {
        bookingSlug = payload[0].slug;
      }
    }
  } catch {
    // Keep fallback slug
  }

  await checkPage(`/book/${bookingSlug}`);

  try {
    const publicThemeBtn = page.locator('button[title*="Switch to"], button[aria-label*="Switch to"]');
    await publicThemeBtn.first().click({ timeout: 10000 });
    record('Theme toggle click (public booking)', true);
  } catch (err) {
    record('Theme toggle click (public booking)', false, String(err));
  }

  await checkPage('/u/rajendradhaka');

  try {
    const profileThemeBtn = page.locator('button[title*="Switch to"], button[aria-label*="Switch to"]');
    await profileThemeBtn.first().click({ timeout: 10000 });
    record('Theme toggle click (public profile)', true);
  } catch (err) {
    record('Theme toggle click (public profile)', false, String(err));
  }

  if (consoleErrors.length > 0) {
    record('Console error check', false, consoleErrors.slice(0, 6).join(' | '));
  } else {
    record('Console error check', true);
  }

  await browser.close();

  const passed = results.filter((r) => r.pass).length;
  console.log(JSON.stringify(results, null, 2));
  console.log(`passed ${passed} of ${results.length}`);

  if (passed !== results.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
