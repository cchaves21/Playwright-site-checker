# 🕸️ Website Health Check with Playwright

Automated testing suite to crawl and validate all pages and links on your Jekyll/GitHub Pages website.

## 🎯 Features

- **Full Site Crawling**: Automatically discovers and tests all internal pages
- **Link Validation**: Checks all links (internal and external) for broken references
- **Configurable**: Flexible options for different testing scenarios
- **Detailed Reporting**: Comprehensive logs and error reporting
- **CI/CD Ready**: Perfect for GitHub Actions and other CI pipelines

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the test files**
2. **Install dependencies**:
   ```bash
   npm init -y
   npm install -D @playwright/test
   npx playwright install
   ```

3. **Create the test file** (`tests/website-health.spec.js`) with the provided code

4. **Run the tests**:
   ```bash
   # Basic run with your website URL
   BASE_URL=https://your-username.github.io npx playwright test
   
   # Or for your specific site
   BASE_URL=https://carloschaves.com npx playwright test
   ```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BASE_URL` | Your website URL | `https://your-username.github.io` | `https://carloschaves.com` |
| `MAX_PAGES` | Maximum pages to crawl | `50` | `100` |
| `TIMEOUT` | Page load timeout (ms) | `30000` | `60000` |
| `SKIP_EXTERNAL` | Skip external link checks | `false` | `true` |
| `EXCLUDE_PATTERNS` | Comma-separated exclude patterns | - | `admin,private,draft` |

### Usage Examples

```bash
# Basic crawl
BASE_URL=https://your-site.com npx playwright test

# Crawl with custom limits
BASE_URL=https://your-site.com MAX_PAGES=25 npx playwright test

# Skip external links (faster)
BASE_URL=https://your-site.com SKIP_EXTERNAL=true npx playwright test

# Exclude certain paths
BASE_URL=https://your-site.com EXCLUDE_PATTERNS=admin,draft npx playwright test

# Run with custom timeout
BASE_URL=https://your-site.com TIMEOUT=60000 npx playwright test

# Run in headful mode (see browser)
BASE_URL=https://your-site.com npx playwright test --headed

# Run specific test only
BASE_URL=https://your-site.com npx playwright test --grep "homepage"
```

## 📋 Test Coverage

The test suite includes:

### 🔍 Full Site Crawl
- Discovers all internal pages automatically
- Validates HTTP status codes
- Checks all links on each page
- Prevents infinite loops with visit tracking

### 🏠 Homepage Validation
- Ensures homepage loads correctly
- Validates page title and content
- Quick smoke test for critical functionality

### 📄 Critical Pages Check
- Tests important pages like `/cv/`, `/about/`, `/contact/`
- Flexible - won't fail if optional pages don't exist
- Easy to customize for your site structure

## 📊 Sample Output

```
🚀 Starting crawl from: https://carloschaves.dev
📝 Max pages limit: 50
🔍 Checking page [1/50]: https://carloschaves.dev
✅ Page OK: https://carloschaves.dev (HTTP 200)
🔗 Found 12 links on https://carloschaves.dev
📌 Added to queue: https://carloschaves.dev/cv/
🌐 Checking external link: https://linkedin.com/in/carloschaves
✅ External link OK: https://linkedin.com/in/carloschaves

============================================================
📊 CRAWL SUMMARY
============================================================
✅ Total pages checked: 5
❌ Pages with errors: 0
🔗 Broken links found: 0

🎉 All 5 pages and their links are working correctly!
```

## 🐛 Error Detection

The tool detects and reports:

- **HTTP 4xx/5xx errors** on pages
- **Broken internal links**
- **Broken external links** (optional)
- **Navigation timeouts**
- **Missing resources**

## 🔧 Customization

### Adding Custom Tests

```javascript
test('Check specific functionality', async ({ page }) => {
  await page.goto(`${BASE_URL}/contact`);
  
  // Test contact form exists
  const form = page.locator('form');
  await expect(form).toBeVisible();
  
  // Test specific elements
  await expect(page.locator('h1')).toContainText('Contact');
});
```

### Modifying Crawler Behavior

```javascript
const options = {
  maxPages: 100,
  skipExternalLinks: true,
  excludePatterns: ['admin', 'private', '.pdf'],
  // Add custom validation logic
  validateContent: async (page, url) => {
    // Custom content validation
  }
};
```

## 🎯 GitHub Actions Integration

Create `.github/workflows/website-health.yml`:

```yaml
name: Website Health Check

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday at 6 AM

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm init -y
        npm install -D @playwright/test
        npx playwright install --with-deps
    
    - name: Run website health check
      env:
        BASE_URL: https://your-username.github.io
        MAX_PAGES: 50
        SKIP_EXTERNAL: false
      run: npx playwright test
      
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

## 🏗️ Project Structure

```
playwright-project/
├── config/
│   └── constants.js          # Consts centralized
├── utils/
│   ├── crawler.js            # Key logic crawler
│   ├── linkChecker.js        # Links validation
├── tests/
│   ├── homepage.spec.js      # Home page check
│   ├── critical-pages.spec.js # Check the main pages
│   └── full-crawl.spec.js    # Crawl complete
├── playwright.config.js      # Playwright config
├── package.json
└── README.md
```

## 📝 Best Practices

1. **Start Small**: Begin with a low `MAX_PAGES` limit
2. **Regular Testing**: Set up automated runs via GitHub Actions
3. **External Links**: Consider skipping external links for faster runs
4. **Exclude Patterns**: Skip admin, draft, or private pages
5. **Monitor Performance**: Adjust timeout values based on your site's performance

## 🤝 Contributing

Feel free to:
- Add new test scenarios
- Improve error handling
- Enhance reporting features
- Submit bug fixes

## 📄 License

MIT License - feel free to use and modify for your projects!

---

**Happy Testing!** 🚀 Keep your website healthy and your links unbroken!
