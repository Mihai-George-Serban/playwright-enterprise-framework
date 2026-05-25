import { test, expect } from '@playwright/test';

test('checkout page requires all customer information', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart/);
  await page.click('[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one/);

  await page.click('[data-test="continue"]');
  await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
});

test('checkout postal code field is required', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart/);
  await page.click('[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one/);

  await page.fill('[data-test="firstName"]', 'John');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.click('[data-test="continue"]');

  await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
});

test('remove item from cart page updates cart contents', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart/);

  await page.click('[data-test="remove-sauce-labs-backpack"]');
  await expect(page.locator('.cart_item')).toHaveCount(0);
});
