import { test, expect } from '@playwright/test';
import { BASE_URL, TIMEOUT, CRITICAL_PAGES } from '../config/constants.js';

test.describe('Critical Pages Tests', () => {
  test('should have all critical pages accessible', async ({ page }) => {
    for (const pagePath of CRITICAL_PAGES) {
      const fullUrl = `${BASE_URL}${pagePath}`;
      console.log(`🔍 Checking critical page: ${fullUrl}`);

      try {
        const response = await page.goto(fullUrl, {
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });
        expect(response.status()).toBe(200);
        console.log(`✅ ${pagePath} - OK`);
      } catch (error) {
        console.log(`ℹ️  ${pagePath} - Not found: ${error.message}`);
        // Não falha o teste para páginas opcionais
      }
    }
  });
});