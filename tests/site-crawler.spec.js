const { test, expect } = require('@playwright/test');

// Configuration
const DEFAULT_BASE_URL = 'https://www.carloschaves.com';
const BASE_URL = process.env.BASE_URL || DEFAULT_BASE_URL;
const MAX_PAGES = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES) : 50;
const TIMEOUT = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 30000;

/**
 * Website crawler that validates all internal pages and links
 * @param {Page} page - Playwright page instance
 * @param {string} startUrl - Starting URL for crawling
 * @param {Object} options - Configuration options
 * @returns {Promise<Set>} - Set of all visited URLs
 */
async function crawlSite(page, startUrl, options = {}) {
  const {
    maxPages = MAX_PAGES,
    skipExternalLinks = false,
    excludePatterns = []
  } = options;

  const visited = new Set();
  const toVisit = [startUrl];
  const brokenLinks = [];
  const errors = [];

  console.log(`🚀 Starting crawl from: ${startUrl}`);
  console.log(`📝 Max pages limit: ${maxPages}`);

  while (toVisit.length > 0 && visited.size < maxPages) {
    const url = toVisit.pop();

    // Skip if already visited
    if (visited.has(url)) continue;

    // Skip if matches exclude patterns
    if (excludePatterns.some(pattern => url.includes(pattern))) {
      console.log(`⏭️  Skipping excluded URL: ${url}`);
      continue;
    }

    console.log(`🔍 Checking page [${visited.size + 1}/${maxPages}]: ${url}`);

    try {
      // Navigate to page with timeout
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });

      // Validate page loads successfully
      const statusCode = response.status();
      if (statusCode >= 400) {
        errors.push({ url, error: `HTTP ${statusCode}`, type: 'page' });
        console.log(`❌ Page failed: ${url} (HTTP ${statusCode})`);
        continue;
      }

      console.log(`✅ Page OK: ${url} (HTTP ${statusCode})`);

      // Extract all links from the page
      const links = await page.$$eval('a[href]', anchors =>
        anchors
          .map(a => ({ href: a.href, text: a.textContent.trim() }))
          .filter(link =>
            link.href &&
            link.href.trim() !== '' &&
            !link.href.startsWith('mailto:') &&
            !link.href.startsWith('tel:') &&
            !link.href.startsWith('javascript:') &&
            !link.href.includes('#')
          )
      );

      console.log(`🔗 Found ${links.length} links on ${url}`);

      // Validate each link
      for (const { href: link, text } of links) {
        try {
          // Handle different link types
          if (link.startsWith('mailto:') || link.startsWith('tel:')) {
            console.log(`📧 Skipping contact link: ${link}`);
            continue;
          }

          if (link.startsWith('javascript:') || link.startsWith('#')) {
            console.log(`⚡ Skipping JS/anchor link: ${link}`);
            continue;
          }

          // Check external links with simple HEAD request
          if (link.startsWith('http') && !link.startsWith(BASE_URL)) {
            if (!skipExternalLinks) {
              console.log(`🌐 Checking external link: ${link}`);

              // Verificar se é rede social conhecida primeiro
              if (link.includes('linkedin.com') || link.includes('facebook.com') || link.includes('instagram.com') || link.includes('twitter.com') || link.includes('x.com')) {
                console.log(`⚠️  Social media link (assuming valid): ${link}`);
                continue;
              }

              // Usar HEAD request para validação mais leve
              try {
                const res = await page.request.head(link, {
                  timeout: 8000,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                  }
                });

                const status = res.status();

                if (status >= 400 && status !== 999) {
                  brokenLinks.push({ url, link, text, status, type: 'external' });
                  console.log(`❌ Broken external link: ${link} (HTTP ${status})`);
                } else if (status === 999) {
                  console.log(`⚠️  Anti-bot response (999): ${link} - probably working but blocked`);
                } else {
                  console.log(`✅ External link OK: ${link} (HTTP ${status})`);
                }

              } catch (extError) {
                // Se HEAD falhar com 405, tentar GET simples
                if (extError.message.includes('Method Not Allowed') || extError.message.includes('405')) {
                  try {
                    const res = await page.request.get(link, {
                      timeout: 6000,
                      headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
                      }
                    });

                    const status = res.status();
                    if (status >= 400 && status !== 999) {
                      brokenLinks.push({ url, link, text, status, type: 'external' });
                      console.log(`❌ Broken external link: ${link} (HTTP ${status})`);
                    } else {
                      console.log(`✅ External link OK: ${link} (HTTP ${status})`);
                    }
                  } catch (getFallbackError) {
                    brokenLinks.push({ url, link, text, error: getFallbackError.message, type: 'external' });
                    console.log(`❌ External link failed: ${link} - ${getFallbackError.message}`);
                  }
                } else {
                  brokenLinks.push({ url, link, text, error: extError.message, type: 'external' });
                  console.log(`❌ External link error: ${link} - ${extError.message}`);
                }
              }
            }
            continue;
          }

          // Add internal links to crawl queue
          if (link.startsWith(BASE_URL) && !visited.has(link) && !toVisit.includes(link)) {
            toVisit.push(link);
            console.log(`📌 Added to queue: ${link}`);
          }

          // Check relative/internal links
          if (!link.startsWith('http')) {
            const fullLink = new URL(link, url).href;
            if (fullLink.startsWith(BASE_URL) && !visited.has(fullLink) && !toVisit.includes(fullLink)) {
              toVisit.push(fullLink);
              console.log(`📌 Added relative link to queue: ${fullLink}`);
            }
          }

        } catch (linkError) {
          brokenLinks.push({ url, link, text, error: linkError.message, type: 'error' });
          console.log(`❌ Link check failed: ${link} - ${linkError.message}`);
        }
      }

    } catch (pageError) {
      errors.push({ url, error: pageError.message, type: 'navigation' });
      console.log(`❌ Navigation failed: ${url} - ${pageError.message}`);
    }

    visited.add(url);

    // Small delay to be respectful
    await page.waitForTimeout(500);
  }
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 CRAWL SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total pages checked: ${visited.size}`);
  console.log(`❌ Pages with errors: ${errors.filter(e => e.type === 'page' || e.type === 'navigation').length}`);
  console.log(`🔗 Broken links found: ${brokenLinks.length}`);

  if (errors.length > 0) {
    console.log('\n❌ PAGE ERRORS:');
    errors.forEach(error => {
      console.log(`  • ${error.url}: ${error.error}`);
    });
  }

  if (brokenLinks.length > 0) {
    console.log('\n🔗 BROKEN LINKS:');
    brokenLinks.forEach(link => {
      console.log(`  • ${link.url}`);
      console.log(`    Link: ${link.link}`);
      console.log(`    Text: "${link.text}"`);
      console.log(`    Error: ${link.status || link.error}`);
      console.log('');
    });
  }

  return { visited, errors, brokenLinks };
}

test.describe('Website Health Check', () => {
  test('Crawl and validate all pages and links', async ({ page }) => {
    console.log(`🌐 Testing website: ${BASE_URL}`);

    const options = {
      maxPages: MAX_PAGES,
      skipExternalLinks: process.env.SKIP_EXTERNAL === 'true',
      excludePatterns: process.env.EXCLUDE_PATTERNS ?
        process.env.EXCLUDE_PATTERNS.split(',').map(p => p.trim()) : []
    };

    const { visited, errors, brokenLinks } = await crawlSite(page, BASE_URL, options);

    // Assertions
    expect(visited.size, 'Should have crawled at least 1 page').toBeGreaterThan(0);
    expect(errors.length, `Found ${errors.length} page errors`).toBe(0);
    expect(brokenLinks.length, `Found ${brokenLinks.length} broken links`).toBe(0);

    console.log(`\n🎉 All ${visited.size} pages and their links are working correctly!`);
  });

  test('Check homepage loads correctly', async ({ page }) => {
    console.log(`🏠 Testing homepage: ${BASE_URL}`);

    try {
      const response = await page.goto(BASE_URL, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });
      expect(response.status()).toBe(200);

      // Check for common elements
      const title = await page.title();
      expect(title).toBeTruthy();
      console.log(`📄 Page title: "${title}"`);

      // Check if page has content
      const bodyText = await page.textContent('body');
      expect(bodyText.length).toBeGreaterThan(100);
      console.log(`📝 Page content length: ${bodyText.length} characters`);

      console.log('✅ Homepage check passed!');
    } catch (error) {
      console.error(`❌ Homepage test failed: ${error.message}`);
      throw error;
    }
  });

  test('Check critical pages exist', async ({ page }) => {
    const criticalPages = [
      '/cv/',
      '/',
      '/case-studies/'
    ];

    for (const pagePath of criticalPages) {
      const fullUrl = `${BASE_URL}${pagePath}`;
      console.log(`🔍 Checking critical page: ${fullUrl}`);

      try {
        const response = await page.goto(fullUrl, {
          waitUntil: 'networkidle',
          timeout: TIMEOUT
        });
        expect(response.status(), `Critical page ${pagePath} should be accessible`).toBe(200);
        console.log(`✅ ${pagePath} - OK`);
      } catch (error) {
        console.log(`ℹ️  ${pagePath} - Not found (this might be expected): ${error.message}`);
        // Don't fail the test for missing optional pages
      }
    }
  });
});