import { WebDriver, By, until } from 'selenium-webdriver';
import { WAIT, login, resetAppState } from './helpers';

async function prepareCheckout(driver: WebDriver, baseUrl: string) {
  await login(driver, baseUrl, 'standard_user', 'secret_sauce');
  await resetAppState(driver);
  await driver.get(baseUrl + '/inventory.html');
}

export async function checkoutTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Navigate to checkout
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.wait(until.urlContains('/cart'), WAIT);
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    testResults.push({ name: 'Checkout - Navigate to checkout', passed: true });
  } catch (e) {
    testResults.push({ name: 'Checkout - Navigate to checkout', passed: false, error: String(e) });
  }

  // Test 2: Checkout requires first name
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-test="error"]')), WAIT);
    const errorMsg = await driver.findElement(By.css('[data-test="error"]')).getText();
    if (errorMsg.includes('First Name is required')) {
      testResults.push({ name: 'Checkout - First name required', passed: true });
    } else {
      testResults.push({ name: 'Checkout - First name required', passed: false, error: 'Unexpected error message' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - First name required', passed: false, error: String(e) });
  }

  // Test 3: Checkout requires postal code
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('last-name')).sendKeys('Doe');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-test="error"]')), WAIT);
    const errorMsg = await driver.findElement(By.css('[data-test="error"]')).getText();
    if (errorMsg.includes('Postal Code is required')) {
      testResults.push({ name: 'Checkout - Postal code required', passed: true });
    } else {
      testResults.push({ name: 'Checkout - Postal code required', passed: false, error: 'Unexpected error message' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - Postal code required', passed: false, error: String(e) });
  }

  // Test 4: Checkout requires last name
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('postal-code')).sendKeys('12345');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-test="error"]')), WAIT);
    const errorMsg = await driver.findElement(By.css('[data-test="error"]')).getText();
    if (errorMsg.includes('Last Name is required')) {
      testResults.push({ name: 'Checkout - Last name required', passed: true });
    } else {
      testResults.push({ name: 'Checkout - Last name required', passed: false, error: 'Unexpected error message' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - Last name required', passed: false, error: String(e) });
  }

  // Test 5: Checkout order summary displays totals
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('last-name')).sendKeys('Doe');
    await driver.findElement(By.id('postal-code')).sendKeys('12345');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.urlContains('/checkout-step-two'), WAIT);
    const subtotal = await driver.findElement(By.css('.summary_subtotal_label')).getText();
    const tax = await driver.findElement(By.css('.summary_tax_label')).getText();
    const total = await driver.findElement(By.css('.summary_total_label')).getText();
    if (subtotal.includes('Item total') && tax.includes('Tax') && total.includes('Total')) {
      testResults.push({ name: 'Checkout - Order summary displays totals', passed: true });
    } else {
      testResults.push({ name: 'Checkout - Order summary displays totals', passed: false, error: 'Summary labels missing' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - Order summary displays totals', passed: false, error: String(e) });
  }

  // Test 6: Complete checkout successfully
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('last-name')).sendKeys('Doe');
    await driver.findElement(By.id('postal-code')).sendKeys('12345');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.urlContains('/checkout-step-two'), WAIT);
    await driver.findElement(By.css('[data-test="finish"]')).click();
    await driver.wait(until.elementLocated(By.css('.complete-header')), WAIT);
    const successMsg = await driver.findElement(By.css('.complete-header')).getText();
    if (successMsg.includes('Thank you for your order')) {
      testResults.push({ name: 'Checkout - Complete checkout successfully', passed: true });
    } else {
      testResults.push({ name: 'Checkout - Complete checkout successfully', passed: false, error: 'Unexpected success message' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - Complete checkout successfully', passed: false, error: String(e) });
  }

  // Test 7: Review order summary
  try {
    await prepareCheckout(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), WAIT);
    await driver.findElement(By.id('first-name')).sendKeys('John');
    await driver.findElement(By.id('last-name')).sendKeys('Doe');
    await driver.findElement(By.id('postal-code')).sendKeys('12345');
    await driver.findElement(By.css('[data-test="continue"]')).click();
    await driver.wait(until.urlContains('/checkout-step-two'), WAIT);
    const cartItems = await driver.findElements(By.css('.cart_item'));
    if (cartItems.length > 0) {
      testResults.push({ name: 'Checkout - Review order summary', passed: true });
    } else {
      testResults.push({ name: 'Checkout - Review order summary', passed: false, error: 'No items in order summary' });
    }
  } catch (e) {
    testResults.push({ name: 'Checkout - Review order summary', passed: false, error: String(e) });
  }

  return testResults;
}
