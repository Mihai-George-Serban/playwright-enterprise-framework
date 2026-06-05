import { test, expect } from '@playwright/test';

test('menu logout returns user to login page', async ({ page }) => {
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

test('inventory sorting updates product order by price', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.selectOption('.product_sort_container', 'lohi');

  const prices = await page.$$eval('.inventory_item_price', els =>
    els.map(el => Number(el.textContent?.replace('$', '').trim() ?? '0'))
  );

  const sortedPrices = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sortedPrices);
});

test('product detail page navigates back to inventory', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="item-4-title-link"]');
  await expect(page).toHaveURL(/inventory-item/);

  await page.click('#back-to-products');
  await expect(page).toHaveURL(/inventory/);
});

test('cart continue shopping returns to inventory page', async ({ page }) => {
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
