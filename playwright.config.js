import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, TIMEOUT } from './config/constants.js';

const CI = !!process.env.CI;

export default defineConfig({
  // Test configuration
  testDir: './tests',
  timeout: TIMEOUT,
  expect: {
    timeout: 5000,
  },

  // Execution settings
  fullyParallel: !CI, // Parallel only in local development
  forbidOnly: CI,
  retries: CI ? 2 : 1,
  workers: CI ? 1 : 2,

  // Reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    CI ? ['github'] : ['list']
  ].filter(Boolean),

  // Global test settings
  use: {
    baseURL: BASE_URL,

    // Timeouts
    actionTimeout: TIMEOUT / 3, // 10 seconds if TIMEOUT is 30s
    navigationTimeout: TIMEOUT,

    // Browser settings
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Debugging
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Performance
    launchOptions: {
      args: [
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    },
  },

  // Projects configuration
  projects: [
    // Quick validation tests
    {
      name: 'quick-tests',
      testMatch: ['homepage.spec.js', 'critical-pages.spec.js'],
      use: {
        ...devices['Desktop Chrome'],
        // Faster settings for quick tests
        actionTimeout: 5000,
        navigationTimeout: 15000,
      },
    },

    // Full website crawl (slower)
    {
      name: 'full-crawl',
      testMatch: 'full-crawl.spec.js',
      use: {
        ...devices['Desktop Chrome', 'Desktop Firefox'],
        // More generous timeouts for crawling
        actionTimeout: 15000,
        navigationTimeout: 45000,
      },
    },

    // Cross-browser testing (optional)
    {
      name: 'firefox',
      testMatch: ['homepage.spec.js', 'critical-pages.spec.js'],
      use: { ...devices['Desktop Firefox'] },
    },

    // Mobile testing (optional)
    {
      name: 'mobile',
      testMatch: 'homepage.spec.js',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Output directories
  outputDir: 'test-results/',

  // Global setup/teardown
  //globalSetup: require.resolve('./utils/global-setup.js'),
  //globalTeardown: require.resolve('./utils/global-teardown.js'),
});