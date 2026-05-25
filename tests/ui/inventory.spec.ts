import { test, expect } from '@playwright/test';

test('add item to cart', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Add first item to cart
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  // Check cart badge
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('remove item from cart', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Add item to cart
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  // Remove item from cart
  await page.click('[data-test="remove-sauce-labs-backpack"]');

  // Cart badge should disappear
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
});

test('view item details', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Click on item name
  await page.click('[data-test="item-4-title-link"]');

  // Should navigate to item details
  await expect(page).toHaveURL(/inventory-item/);
  await expect(page.locator('.inventory_details_name')).toBeVisible();
});