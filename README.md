# 🎭 Playwright Site Checker

Automated tool for comprehensive website validation using Playwright. Checks pages, internal links, external links, and generates detailed site health reports.

## 🚀 Features

- ✅ **Complete site crawling** - Automatically discovers and tests all pages
- 🔗 **Link validation** - Verifies internal and external links
- 📊 **Detailed reports** - HTML and JSON with comprehensive results
- 🎯 **Quick tests** - Critical page validation
- 🌐 **Cross-browser** - Support for Chrome, Firefox, and mobile
- ⚡ **Performance optimized** - Specific configurations per test type

## 📁 Project Structure

```
playwright-project/
├── config/
│   └── constants.js          # Centralized configuration
├── utils/
│   ├── crawler.js            # Main crawler logic
│   ├── linkChecker.js        # Link validator
├── tests/
│   ├── homepage.spec.js      # Homepage tests
│   ├── critical-pages.spec.js # Critical pages tests
│   └── full-crawl.spec.js    # Complete site crawl
├── playwright.config.js      # Playwright configuration
├── package.json
└── README.md
```

## ⚙️ Installation

### 1. Install dependencies
```bash
npm install
```

### 2. Install Playwright browsers
```bash
npm run install:browsers
```

## 🎯 Usage

### **Main Commands**

```bash
# Run all tests (headless)
npm test

# Quick tests (homepage + critical pages)
npm run test:quick

# Complete site crawl (slower)
npm run test:crawl
```

### **Debugging and Development**

```bash
# Run with visible browser
npm run test:headed

# Quick tests only with interface
npm run test:headed:quick

# Step-by-step debug mode
npm run test:debug

# Playwright GUI interface
npm run test:ui
```

### **Reports**

```bash
# View HTML report from last test run
npm run report
```

## 🔧 Configuration

### **Environment Variables**

Create a `.env` file or set environment variables:

```bash
# Base URL of the site to test
BASE_URL=https://www.yoursite.com

# Maximum number of pages to crawl
MAX_PAGES=50

# Timeout in milliseconds
TIMEOUT=30000

# Skip external links (true/false)
SKIP_EXTERNAL=false

# Patterns to exclude URLs (comma-separated)
EXCLUDE_PATTERNS=/admin,/private
```

### **Usage Examples with Variables**

```bash
# Test local site
BASE_URL=http://localhost:4000 npm run test:quick

# Limited crawl
MAX_PAGES=10 npm run test:crawl

# Ignore external links
SKIP_EXTERNAL=true npm run test:crawl

# Custom timeout
TIMEOUT=60000 npm test
```

## 🎨 Test Types

### **1. Quick Tests (`quick-tests`)**
- Homepage validation
- Critical pages verification
- Execution: ~30 seconds
- Ideal for: CI/CD, daily development

### **2. Full Crawl (`full-crawl`)**
- Discovers all site pages
- Validates all internal and external links
- Generates complete site map
- Execution: 2-10 minutes (depends on site)
- Ideal for: Complete validation, pre-deployment

### **3. Cross-browser (`firefox`, `mobile`)**
- Tests on Firefox and mobile devices
- Ensures compatibility
- Ideal for: UX validation

## 📊 Reports

Tests generate reports in multiple formats:

- **HTML**: Interactive visual interface (`playwright-report/`)
- **JSON**: Structured data for integration (`test-results.json`)
- **Screenshots**: Captures on failure
- **Videos**: Recording of failed tests

## 🏗️ CI/CD Integration

### **GitHub Actions**

```yaml
- name: Run Playwright tests
  run: npm run test:quick

- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### **Automatic Configuration**

- **Local**: Parallel execution, interface available
- **CI**: Sequential execution, headless, optimized reports

## 🔍 Troubleshooting

### **Common Issues**

**1. Local site doesn't load:**
```bash
# Check if site is running
curl http://localhost:4000

# Wait for site to start before tests
BASE_URL=http://localhost:4000 npm run test:quick
```

**2. Too many broken external links:**
```bash
# Ignore external links
SKIP_EXTERNAL=true npm run test:crawl
```

**3. Timeout on slow pages:**
```bash
# Increase timeout
TIMEOUT=60000 npm test
```

**4. Memory error on large crawls:**
```bash
# Limit number of pages
MAX_PAGES=20 npm run test:crawl
```

### **Advanced Debugging**

```bash
# See detailed logs
DEBUG=pw:* npm run test:quick

# Run specific test
npx playwright test homepage.spec.js --headed

# Generate trace for analysis
npx playwright test --trace on
```

## 📈 Best Practices

### **Daily Development**
1. `npm run test:quick` before commits
2. `npm run test:headed:quick` for debugging
3. `npm run report` to view results

### **Before Deployment**
1. `npm run test:crawl` for complete validation
2. Check broken link reports
3. Test on multiple browsers if needed

### **CI/CD Pipeline**
1. `npm run test:quick` on PRs
2. `npm run test:crawl` on production deployment
3. Save report artifacts

## 🛠️ Customization

### **Add New Critical Pages**

Edit `config/constants.js`:
```javascript
export const CRITICAL_PAGES = [
  '/',
  '/about',
  '/contact',
  '/your-new-page'  // Add here
];
```

### **Exclude URLs from Crawl**

```bash
EXCLUDE_PATTERNS="/admin,/private,/test" npm run test:crawl
```

### **Customize Timeouts**

Edit `config/constants.js`:
```javascript
export const TIMEOUT = 45000; // 45 seconds
```

## 📝 Changelog

### v1.0.0
- ✅ Modular structure with Page Objects
- ✅ Complete website crawler
- ✅ Internal and external link validation
- ✅ HTML and JSON reports
- ✅ CI/CD optimized configuration
- ✅ Multiple test project support

---

## 🤝 Contributing

1. Fork the project
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ by [Carlos Chaves](https://www.carloschaves.com)**