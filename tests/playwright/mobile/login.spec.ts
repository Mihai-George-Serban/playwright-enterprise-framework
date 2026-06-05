import { test, expect } from '@playwright/test';

test('mobile login and add to cart', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');

  await expect(page).toHaveURL(/cart/);
  await expect(page.locator('.cart_item')).toHaveCount(1);
});
