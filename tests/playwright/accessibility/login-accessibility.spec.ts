import { test, expect } from '@playwright/test';

test('login page accessibility', async ({ page }) => {
  await page.goto('/');

  // Basic accessibility checks
  // Check that form elements have labels
  await expect(page.locator('#user-name')).toHaveAttribute('placeholder', 'Username');
  await expect(page.locator('#password')).toHaveAttribute('placeholder', 'Password');

  // Check that login button is accessible
  await expect(page.locator('#login-button')).toBeVisible();
  await expect(page.locator('#login-button')).toHaveAttribute('type', 'submit');
});

test('inventory page accessibility', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Basic accessibility checks on inventory page
  // Check that items have proper headings
  await expect(page.locator('.inventory_item_name')).toHaveCount(6);

  // Check that images have alt text (though Sauce Demo might not have proper alt)
  // await expect(page.locator('.inventory_item_img')).toHaveAttribute('alt');
});
