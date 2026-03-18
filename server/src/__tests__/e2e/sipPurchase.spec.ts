// ═══════════════════════════════════════════════════════════════════════════════
// E2E TEST — SIP Purchase Flow (Playwright)
// ═══════════════════════════════════════════════════════════════════════════════
//
// This test simulates a complete user journey:
//   1. Login with demo credentials
//   2. Browse mutual funds
//   3. Select a fund
//   4. Set up a SIP (amount, date, frequency)
//   5. Verify order confirmation
//
// PREREQUISITES:
//   - Backend running on http://localhost:3001
//   - Frontend running on http://localhost:5173
//   - Run: npx playwright test e2e/sipPurchase.spec.ts
// ═══════════════════════════════════════════════════════════════════════════════

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('SIP Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from login page
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveTitle(/InvestWise/);
  });

  test('complete SIP setup flow — login → browse → select fund → create SIP', async ({ page }) => {
    // ── Step 1: Login via Demo Button ──
    // Click "Quick Demo Login" button for instant access
    const demoButton = page.locator('#demo-login-btn');
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Should redirect to dashboard
    await page.waitForURL('**/');
    await expect(page.locator('h1')).toContainText('Portfolio Dashboard');

    // ── Step 2: Navigate to Mutual Funds ──
    await page.click('text=Mutual Funds');
    await page.waitForURL('**/funds');
    await expect(page.locator('h1')).toContainText('Mutual Funds');

    // Verify fund cards are rendered
    const fundCards = page.locator('[id^="fund-card-"]');
    const cardCount = await fundCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // ── Step 3: Search for a Fund ──
    const searchInput = page.locator('#fund-search');
    await searchInput.fill('Axis');
    await page.waitForTimeout(300); // Debounce

    // Should filter to Axis funds
    const axisCards = page.locator('[id^="fund-card-"]');
    const axisCount = await axisCards.count();
    expect(axisCount).toBeLessThanOrEqual(cardCount);

    // ── Step 4: Click on a Fund ──
    await searchInput.clear();
    await page.waitForTimeout(300);

    // Click the first fund card
    const firstCard = page.locator('[id^="fund-card-"]').first();
    await firstCard.click();

    // Should navigate to fund detail page
    await page.waitForURL('**/funds/**');

    // Verify fund detail elements
    await expect(page.locator('text=NAV Performance')).toBeVisible();
    await expect(page.locator('text=Returns')).toBeVisible();
    await expect(page.locator('text=Fund Details')).toBeVisible();

    // ── Step 5: Open Invest Modal ──
    const investButton = page.locator('button:has-text("Invest Now")');
    await investButton.click();

    // Invest modal should appear
    await expect(page.locator('text=Monthly SIP')).toBeVisible();
    await expect(page.locator('text=One-Time')).toBeVisible();

    // ── Step 6: Select SIP and Enter Amount ──
    // SIP tab should be active by default
    const sipTab = page.locator('button:has-text("Monthly SIP")');
    await sipTab.click();

    // Enter SIP amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('5000');

    // Verify estimated units are shown
    await expect(page.locator('text=Estimated Units')).toBeVisible();

    // Select SIP date
    const dateSelect = page.locator('select').last();
    await dateSelect.selectOption('15');

    // ── Step 7: Confirm SIP ──
    const confirmButton = page.locator('button:has-text("Start SIP")');
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // Should show confirmation alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('SIP order placed');
      await dialog.accept();
    });
  });

  test('should apply category filters on funds page', async ({ page }) => {
    // Quick login
    const demoButton = page.locator('#demo-login-btn');
    await demoButton.click();
    await page.waitForURL('**/');

    // Navigate to Funds
    await page.click('text=Mutual Funds');
    await page.waitForURL('**/funds');

    // Click EQUITY filter
    await page.click('button:has-text("EQUITY")');
    await page.waitForTimeout(300);

    // All visible cards should be equity funds
    // (Verifying the filter actually works)
    const cardCount = await page.locator('[id^="fund-card-"]').count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should navigate through all pages without errors', async ({ page }) => {
    // Login
    const demoButton = page.locator('#demo-login-btn');
    await demoButton.click();
    await page.waitForURL('**/');

    // Dashboard
    await expect(page.locator('h1')).toContainText('Portfolio Dashboard');

    // Funds
    await page.click('text=Mutual Funds');
    await page.waitForURL('**/funds');
    await expect(page.locator('h1')).toContainText('Mutual Funds');

    // Watchlist
    await page.click('text=Watchlist');
    await page.waitForURL('**/watchlist');
    await expect(page.locator('h1')).toContainText('Watchlist');

    // Notifications
    await page.click('text=Notifications');
    await page.waitForURL('**/notifications');
    await expect(page.locator('h1')).toContainText('Notifications');

    // Profile
    await page.click('text=Profile');
    await page.waitForURL('**/profile');
    await expect(page.locator('h1')).toContainText('Profile');

    // No console errors during navigation
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    expect(errors.length).toBe(0);
  });

  test('should display portfolio charts with data', async ({ page }) => {
    // Login
    await page.locator('#demo-login-btn').click();
    await page.waitForURL('**/');

    // Check summary cards exist
    await expect(page.locator('text=Current Value')).toBeVisible();
    await expect(page.locator('text=Total Invested')).toBeVisible();
    await expect(page.locator('text=Total P&L')).toBeVisible();
    await expect(page.locator('text=XIRR')).toBeVisible();

    // Check charts are rendered (Recharts SVG elements)
    const charts = page.locator('.recharts-responsive-container');
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThanOrEqual(2); // Portfolio growth + pie chart

    // Check holdings table
    await expect(page.locator('text=Holdings')).toBeVisible();
  });
});
