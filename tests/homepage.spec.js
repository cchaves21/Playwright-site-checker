import { test, expect } from '@playwright/test';
import { BASE_URL, TIMEOUT } from '../config/constants.js';

test.describe('Homepage Tests', () => {
  test('should load correctly', async ({ page }) => {
    console.log(`🏠 Testing homepage: ${BASE_URL}`);

    const response = await page.goto(BASE_URL, {
      waitUntil: 'networkidle',
      timeout: TIMEOUT
    });

    expect(response.status()).toBe(200);

    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`📄 Page title: "${title}"`);

    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(100);
    console.log(`📝 Page content length: ${bodyText.length} characters`);

    console.log('✅ Homepage check passed!');
  });
});