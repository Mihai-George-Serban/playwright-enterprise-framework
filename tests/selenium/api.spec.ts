import { WebDriver, By, until } from 'selenium-webdriver';
import { login } from './helpers';

const API_WAIT = 5000;

export async function apiTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Root page loads successfully
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Swag Labs')) {
      testResults.push({ name: 'API - Root page loads', passed: true });
    } else {
      testResults.push({ name: 'API - Root page loads', passed: false, error: 'Page does not contain Swag Labs' });
    }
  } catch (e) {
    testResults.push({ name: 'API - Root page loads', passed: false, error: String(e) });
  }

  // Test 2: Login page has correct title
  try {
    await driver.get(baseUrl + '/');
    const title = await driver.getTitle();
    if (title.includes('Swag') || title.includes('Labs')) {
      testResults.push({ name: 'API - Page title correct', passed: true });
    } else {
      testResults.push({ name: 'API - Page title correct', passed: false, error: `Title: ${title}` });
    }
  } catch (e) {
    testResults.push({ name: 'API - Page title correct', passed: false, error: String(e) });
  }

  // Test 3: Inventory page loads
  try {
    await login(driver, baseUrl, 'standard_user', 'secret_sauce', API_WAIT);
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Products')) {
      testResults.push({ name: 'API - Inventory page loads', passed: true });
    } else {
      testResults.push({ name: 'API - Inventory page loads', passed: false, error: 'Inventory page not loaded' });
    }
  } catch (e) {
    testResults.push({ name: 'API - Inventory page loads', passed: false, error: String(e) });
  }

  // Test 4: Cart page loads
  try {
    await driver.get(baseUrl + '/cart.html');
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('cart') || pageSource.includes('Cart')) {
      testResults.push({ name: 'API - Cart page loads', passed: true });
    } else {
      testResults.push({ name: 'API - Cart page loads', passed: false, error: 'Cart page not loaded' });
    }
  } catch (e) {
    testResults.push({ name: 'API - Cart page loads', passed: false, error: String(e) });
  }

  // Test 5: Checkout page loads
  try {
    await driver.get(baseUrl + '/checkout-step-one.html');
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('Checkout')) {
      testResults.push({ name: 'API - Checkout page loads', passed: true });
    } else {
      testResults.push({ name: 'API - Checkout page loads', passed: false, error: 'Checkout page not loaded' });
    }
  } catch (e) {
    testResults.push({ name: 'API - Checkout page loads', passed: false, error: String(e) }); 
  }

  // Test 6: Resources are loaded
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.css('body')), 5000);
    const scripts = await driver.findElements(By.css('script'));
    if (scripts.length > 0) {
      testResults.push({ name: 'API - Resources loaded', passed: true });
    } else {
      testResults.push({ name: 'API - Resources loaded', passed: false, error: 'No script resources found' });
    }
  } catch (e) {
    testResults.push({ name: 'API - Resources loaded', passed: false, error: String(e) });
  }

  return testResults;
}
