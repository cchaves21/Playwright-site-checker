import { MAX_PAGES, TIMEOUT, BASE_URL } from '../config/constants.js';
import LinkChecker from './linkChecker.js';

class WebsiteCrawler {
  constructor(page, options = {}) {
    this.page = page;
    this.options = {
      maxPages: MAX_PAGES,
      skipExternalLinks: false,
      excludePatterns: [],
      ...options
    };
    this.linkChecker = new LinkChecker(page, BASE_URL);
    this.visited = new Set();
    this.toVisit = [];
    this.brokenLinks = [];
    this.errors = [];
  }

  async crawl(startUrl) {
    this.toVisit = [startUrl];
    console.log(`🚀 Starting crawl from: ${startUrl}`);
    console.log(`📝 Max pages limit: ${this.options.maxPages}`);

    while (this.toVisit.length > 0 && this.visited.size < this.options.maxPages) {
      const url = this.toVisit.pop();

      if (this.shouldSkipUrl(url)) continue;

      await this.crawlPage(url);
      this.visited.add(url);
      await this.page.waitForTimeout(500);
    }

    this.printSummary();
    return {
      visited: this.visited,
      errors: this.errors,
      brokenLinks: this.brokenLinks
    };
  }

  shouldSkipUrl(url) {
    if (this.visited.has(url)) return true;

    if (this.options.excludePatterns.some(pattern => url.includes(pattern))) {
      console.log(`⏭️  Skipping excluded URL: ${url}`);
      return true;
    }

    return false;
  }

  async crawlPage(url) {
    console.log(`🔍 Checking page [${this.visited.size + 1}/${this.options.maxPages}]: ${url}`);

    try {
      const response = await this.page.goto(url, {
        waitUntil: 'networkidle',
        timeout: TIMEOUT
      });

      const statusCode = response.status();
      if (statusCode >= 400) {
        this.errors.push({ url, error: `HTTP ${statusCode}`, type: 'page' });
        console.log(`❌ Page failed: ${url} (HTTP ${statusCode})`);
        return;
      }

      console.log(`✅ Page OK: ${url} (HTTP ${statusCode})`);
      await this.extractAndCheckLinks(url);

    } catch (error) {
      this.errors.push({ url, error: error.message, type: 'navigation' });
      console.log(`❌ Navigation failed: ${url} - ${error.message}`);
    }
  }

  async extractAndCheckLinks(url) {
    const links = await this.page.$$eval('a[href]', anchors =>
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

    for (const { href: link, text } of links) {
      await this.processLink(link, text, url);
    }
  }

  async processLink(link, text, currentUrl) {
    if (this.isExternalLink(link)) {
      if (!this.options.skipExternalLinks) {
        const result = await this.linkChecker.checkExternalLink(link, currentUrl, text);
        if (!result.valid) {
          this.brokenLinks.push({
            url: currentUrl,
            link,
            text,
            status: result.status,
            error: result.error,
            type: result.type
          });
        }
      }
      return;
    }

    this.addInternalLinkToQueue(link, currentUrl);
  }

  isExternalLink(link) {
    return link.startsWith('http') && !link.startsWith(BASE_URL);
  }

  addInternalLinkToQueue(link, currentUrl) {
    let fullLink = link;

    if (!link.startsWith('http')) {
      fullLink = new URL(link, currentUrl).href;
    }

    if (fullLink.startsWith(BASE_URL) &&
      !this.visited.has(fullLink) &&
      !this.toVisit.includes(fullLink)) {
      this.toVisit.push(fullLink);
      console.log(`📌 Added to queue: ${fullLink}`);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWL SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Total pages checked: ${this.visited.size}`);
    console.log(`❌ Pages with errors: ${this.errors.filter(e => e.type === 'page' || e.type === 'navigation').length}`);
    console.log(`🔗 Broken links found: ${this.brokenLinks.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      this.errors.forEach(error => {
        console.log(`  • ${error.url}: ${error.error}`);
      });
    }

    if (this.brokenLinks.length > 0) {
      console.log('\n🔗 BROKEN LINKS:');
      this.brokenLinks.forEach(link => {
        console.log(`  • ${link.url}`);
        console.log(`    Link: ${link.link}`);
        console.log(`    Text: "${link.text}"`);
        console.log(`    Error: ${link.status || link.error}`);
        console.log('');
      });
    }
  }
}

export default WebsiteCrawler;