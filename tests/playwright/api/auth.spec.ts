import { test, expect } from '@playwright/test';

test('web root responds successfully', async ({ request }) => {
  const response = await request.get('/');
  await expect(response).toBeOK();
  const body = await response.text();
  expect(body).toContain('Swag Labs');
});

test('login page HTML contains expected title text', async ({ request }) => {
  const response = await request.get('/');
  await expect(response.status()).toBe(200);
  const body = await response.text();
  // The app uses "Swag Labs" as the page title
  expect(body).toContain('<title>Swag Labs</title>');
});
