import { test, expect } from '@playwright/test';

test.describe('Send SMS Flow', () => {
  test('should send SMS successfully', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for page to load
    await expect(page).toHaveTitle(/SMS Dashboard/);

    // Click on Send SMS link
    await page.click('a:has-text("Send SMS")')  ;
    
    // Fill in phone number
    await page.fill('input[placeholder*="Phone"]', '+27123456789');
    
    // Fill in message
    await page.fill('textarea[placeholder*="message"]', 'Test message from Playwright');
    
    // Submit form
    await page.click('button:has-text("Send")');
    
    // Wait for success message
    await expect(page.locator('text=sent successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for invalid phone', async ({ page }) => {
    await page.goto('/send');
    await page.fill('input[placeholder*="Phone"]', 'invalid');
    await page.click('button:has-text("Send")');
    await expect(page.locator('text=Invalid phone')).toBeVisible();
  });
});
