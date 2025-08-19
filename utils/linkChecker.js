const { SOCIAL_MEDIA_DOMAINS } = require('../config/constants');

class LinkChecker {
  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async checkExternalLink(link, url, text) {
    // Skip social media links
    if (SOCIAL_MEDIA_DOMAINS.some(domain => link.includes(domain))) {
      console.log(`⚠️  Social media link (assuming valid): ${link}`);
      return { valid: true, type: 'social' };
    }

    try {
      const res = await this.page.request.head(link, {
        timeout: 8000,
        headers: this.getHeaders()
      });

      const status = res.status();
      return this.processResponse(status, link);
    } catch (error) {
      return await this.handleRequestError(error, link);
    }
  }

  getHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
      'DNT': '1',
      'Connection': 'keep-alive'
    };
  }

  processResponse(status, link) {
    if (status >= 400 && status !== 999) {
      console.log(`❌ Broken external link: ${link} (HTTP ${status})`);
      return { valid: false, status, type: 'external' };
    } else if (status === 999) {
      console.log(`⚠️  Anti-bot response (999): ${link}`);
      return { valid: true, type: 'blocked' };
    } else {
      console.log(`✅ External link OK: ${link} (HTTP ${status})`);
      return { valid: true, status, type: 'external' };
    }
  }

  async handleRequestError(error, link) {
    if (error.message.includes('Method Not Allowed') || error.message.includes('405')) {
      return await this.tryGetRequest(link);
    }

    console.log(`❌ External link error: ${link} - ${error.message}`);
    return { valid: false, error: error.message, type: 'external' };
  }

  async tryGetRequest(link) {
    try {
      const res = await this.page.request.get(link, {
        timeout: 6000,
        headers: this.getHeaders()
      });

      return this.processResponse(res.status(), link);
    } catch (error) {
      console.log(`❌ External link failed: ${link} - ${error.message}`);
      return { valid: false, error: error.message, type: 'external' };
    }
  }
}

module.exports = LinkChecker;