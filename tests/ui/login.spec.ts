/*
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
*/

import { test, expect } from '@playwright/test';

test('successful login', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');

  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);
});

test('login with invalid username', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'invalid_user');
  await page.fill('#password', 'secret_sauce');

  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
});

test('login with invalid password', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');

  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
});

test('login with empty username', async ({ page }) => {
  await page.goto('/');

  await page.fill('#password', 'secret_sauce');

  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
});

test('login with empty password', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'standard_user');

  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Password is required');
});

test('login with locked out user', async ({ page }) => {
  await page.goto('/');

  await page.fill('#user-name', 'locked_out_user');
  await page.fill('#password', 'secret_sauce');

  await page.click('#login-button');

  await expect(page.locator('[data-test="error"]')).toContainText('Sorry, this user has been locked out');
});