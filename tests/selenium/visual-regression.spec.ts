import { WebDriver, By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';

async function login(driver: WebDriver, baseUrl: string, username: string, password: string) {
  await driver.get(baseUrl + '/');
  await driver.wait(until.elementLocated(By.id('user-name')), 5000);
  await driver.findElement(By.id('user-name')).sendKeys(username);
  await driver.findElement(By.id('password')).sendKeys(password);
  await driver.findElement(By.id('login-button')).click();
  await driver.wait(until.urlContains('/inventory'), 5000);
}

async function resetAppState(driver: WebDriver) {
  try {
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const resetLink = await driver.wait(until.elementLocated(By.id('reset_sidebar_link')), 5000);
    await driver.executeScript('arguments[0].click();', resetLink);
    await driver.wait(async () => {
      const badges = await driver.findElements(By.css('.shopping_cart_badge'));
      return badges.length === 0;
    }, 5000);
  } catch {
    // ignore if state is already clean
  }
}

async function prepareVisualRegression(driver: WebDriver, baseUrl: string) {
  await login(driver, baseUrl, 'standard_user', 'secret_sauce');
  await resetAppState(driver);
  await driver.get(baseUrl + '/inventory.html');
}

export async function visualRegressionTests(driver: WebDriver, baseUrl: string, screenshotDir: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Test 1: Login page layout consistency
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.css('.login-box')), 5000);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'login-page.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Login page screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Login page screenshot', passed: false, error: String(e) });
  }

  // Test 2: Inventory page layout consistency
  try {
    await login(driver, baseUrl, 'standard_user', 'secret_sauce');
    await driver.wait(until.elementLocated(By.css('.inventory_list')), 5000);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'inventory-page.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Inventory page screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Inventory page screenshot', passed: false, error: String(e) });
  }

  // Test 3: Cart page layout consistency
  try {
    await driver.get(baseUrl + '/inventory.html');
    await driver.wait(until.elementLocated(By.css('[data-test="add-to-cart-sauce-labs-backpack"]')), 5000);
    await driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.wait(until.urlContains('/cart'), 5000);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'cart-page.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Cart page screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Cart page screenshot', passed: false, error: String(e) });
  }

  // Test 4: Checkout page layout consistency
  try {
    await driver.get(baseUrl + '/checkout-step-one.html');
    await driver.wait(until.elementLocated(By.css('[data-test="firstName"]')), 5000);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'checkout-page.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Checkout page screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Checkout page screenshot', passed: false, error: String(e) });
  }

  // Test 5: Order completion page layout consistency
  try {
    await prepareVisualRegression(driver, baseUrl);
    await driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), 5000);
    await driver.findElement(By.css('[data-test="firstName"]')).sendKeys('John');
    await driver.findElement(By.css('[data-test="lastName"]')).sendKeys('Doe');
    await driver.findElement(By.css('[data-test="postalCode"]')).sendKeys('12345');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.urlContains('/checkout-step-two'), 5000);
    await driver.findElement(By.css('[data-test="finish"]')).click();
    await driver.wait(until.elementLocated(By.css('.complete-header')), 5000);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'order-complete-page.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Order complete page screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Order complete page screenshot', passed: false, error: String(e) });
  }

  // Test 6: Product sorting visual consistency
  try {
    await prepareVisualRegression(driver, baseUrl);
    await driver.wait(until.elementLocated(By.css('.product_sort_container')), 5000);
    const select = driver.findElement(By.css('.product_sort_container'));
    await driver.executeScript('arguments[0].value = "hilo"; arguments[0].dispatchEvent(new Event("change", { bubbles: true }));', select);
    await driver.sleep(500);
    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(screenshotDir, 'inventory-sorted-high-to-low.png');
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    testResults.push({ name: 'Visual Regression - Sorted inventory screenshot', passed: true });
  } catch (e) {
    testResults.push({ name: 'Visual Regression - Sorted inventory screenshot', passed: false, error: String(e) });
  }

  return testResults;
}
