import { test, expect } from '@playwright/test';

test('view cart with items', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Add two items to cart
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

  // Go to cart
  await page.click('.shopping_cart_link');

  await expect(page).toHaveURL(/cart/);
  await expect(page.locator('.cart_item')).toHaveCount(2);
});

test('checkout process', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  // Add item to cart
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  // Go to cart and checkout
  await page.click('.shopping_cart_link');
  await page.click('[data-test="checkout"]');

  // Fill checkout info
  await page.fill('[data-test="firstName"]', 'John');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '12345');
  await page.click('[data-test="continue"]');

  // Verify checkout overview
  await expect(page).toHaveURL(/checkout-step-two/);
  await expect(page.locator('.cart_item')).toHaveCount(1);

  // Complete checkout
  await page.click('[data-test="finish"]');
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});