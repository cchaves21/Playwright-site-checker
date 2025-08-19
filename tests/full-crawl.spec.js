import { test, expect } from '@playwright/test';
import { BASE_URL, MAX_PAGES } from '../config/constants.js';
import WebsiteCrawler from '../utils/crawler.js';

test.describe('Full Website Crawl', () => {
  test('should crawl and validate all pages and links', async ({ page }) => {
    console.log(`🌐 Testing website: ${BASE_URL}`);

    const options = {
      maxPages: MAX_PAGES,
      skipExternalLinks: process.env.SKIP_EXTERNAL === 'true',
      excludePatterns: process.env.EXCLUDE_PATTERNS ?
        process.env.EXCLUDE_PATTERNS.split(',').map(p => p.trim()) : []
    };

    const crawler = new WebsiteCrawler(page, options);
    const { visited, errors, brokenLinks } = await crawler.crawl(BASE_URL);

    expect(visited.size).toBeGreaterThan(0);
    expect(errors.length).toBe(0);
    expect(brokenLinks.length).toBe(0);

    console.log(`\n🎉 All ${visited.size} pages and their links are working correctly!`);
  });
});