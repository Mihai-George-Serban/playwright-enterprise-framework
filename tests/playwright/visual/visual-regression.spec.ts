import { test, expect, Page } from '@playwright/test';

const credentials = {
  username: 'standard_user',
  password: 'secret_sauce',
};

const login = async (page: Page) => {
  await page.goto('/');
  await page.fill('#user-name', credentials.username);
  await page.fill('#password', credentials.password);
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();
};

test.describe('Visual regression tests', () => {
  test('Login page should match baseline screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });

  test('Inventory page should match baseline screenshot after login', async ({ page }) => {
    await login(page);
    await expect(page).toHaveScreenshot('inventory-page.png', { fullPage: true });
  });

  test('Cart page should match baseline screenshot after adding item', async ({ page }) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart_list')).toBeVisible();
    await expect(page).toHaveScreenshot('cart-page.png', { fullPage: true });
  });
});
