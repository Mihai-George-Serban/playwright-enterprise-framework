import { test, expect } from '@playwright/test';

test('login page fields and button are accessible', async ({ page }) => {
  await page.goto('/');

  // Sauce Demo uses placeholders rather than visible <label> elements
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('keyboard login works using enter key', async ({ page }) => {
  await page.goto('/');

  // Use placeholders / ids to interact reliably
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: /login/i }).press('Enter');

  await expect(page).toHaveURL(/inventory/);
});

test('inventory images expose alt attributes', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  const imagesWithAlt = await page.$$eval('.inventory_item_img img', imgs =>
    imgs.filter(img => img.hasAttribute('alt')).length
  );

  expect(imagesWithAlt).toBe(6);
});

test('inventory sort dropdown is accessible by role', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await expect(page.getByRole('combobox')).toBeVisible();
});

test('cart and checkout pages have accessible headings', async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  // The cart page uses a `.title` element for the page title
  await expect(page.locator('.title')).toContainText(/your cart/i);

  await page.click('[data-test="checkout"]');
  // Checkout pages also use `.title` for the main heading
  await expect(page.locator('.title')).toContainText(/checkout: your information/i);
});
