import { test, expect } from '@playwright/test';

test('mobile menu logout returns user to login page', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');

  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await expect(page.locator('#login-button')).toBeVisible();
});

test('mobile continue shopping returns to inventory', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');

  await expect(page).toHaveURL(/cart/);
  await page.click('[data-test="continue-shopping"]');

  await expect(page).toHaveURL(/inventory/);
});
