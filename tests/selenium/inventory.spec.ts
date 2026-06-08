import { WebDriver, By, until } from 'selenium-webdriver';
import { WAIT, login, resetAppState } from './helpers';

async function prepareInventory(driver: WebDriver, baseUrl: string) {
  await login(driver, baseUrl, 'standard_user', 'secret_sauce');
  await resetAppState(driver);
  await driver.get(baseUrl + '/inventory.html');
}

export async function inventoryTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Display inventory items
  try {
    await login(driver, baseUrl, 'standard_user', 'secret_sauce');
    const items = await driver.findElements(By.css('.inventory_item'));
    if (items.length === 6) {
      testResults.push({ name: 'Inventory - Display all items', passed: true });
    } else {
      testResults.push({ name: 'Inventory - Display all items', passed: false, error: `Expected 6 items, got ${items.length}` });
    }
  } catch (e) {
    testResults.push({ name: 'Inventory - Display all items', passed: false, error: String(e) });
  }

  // Test 2: Add item to cart
  try {
    await prepareInventory(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    const badge = await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT);
    const badgeText = await badge.getText();
    if (badgeText === '1') {
      testResults.push({ name: 'Inventory - Add item to cart', passed: true });
    } else {
      testResults.push({ name: 'Inventory - Add item to cart', passed: false, error: `Expected badge "1", got "${badgeText}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Inventory - Add item to cart', passed: false, error: String(e) });
  }

  // Test 3: Remove item from cart
  try {
    await prepareInventory(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    await driver.wait(until.elementLocated(By.id('remove-sauce-labs-backpack')), WAIT);
    await driver.findElement(By.id('remove-sauce-labs-backpack')).click();
    try {
      await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT);
      testResults.push({ name: 'Inventory - Remove item from cart', passed: false, error: 'Badge should be removed' });
    } catch {
      testResults.push({ name: 'Inventory - Remove item from cart', passed: true });
    }
  } catch (e) {
    testResults.push({ name: 'Inventory - Remove item from cart', passed: false, error: String(e) });
  }

  // Test 4: Navigate to product details
  try {
    await prepareInventory(driver, baseUrl);
    await driver.findElement(By.css('[data-test="item-4-title-link"]')).click();
    await driver.wait(until.urlContains('/inventory-item'), WAIT);
    testResults.push({ name: 'Inventory - Navigate to product details', passed: true });
  } catch (e) {
    testResults.push({ name: 'Inventory - Navigate to product details', passed: false, error: String(e) });
  }

  // Test 5: Sort items by price low to high
  try {
    await prepareInventory(driver, baseUrl);
    await driver.wait(until.elementLocated(By.css('.product_sort_container')), WAIT);
    const select = await driver.findElement(By.css('.product_sort_container'));
    await driver.executeScript('arguments[0].value = "lohi"; arguments[0].dispatchEvent(new Event("change", { bubbles: true }));', select);
    await driver.sleep(500);
    const firstPrice = await driver.findElement(By.css('.inventory_item_price')).getText();
    if (firstPrice.includes('7.99')) {
      testResults.push({ name: 'Inventory - Sort items low to high', passed: true });
    } else {
      testResults.push({ name: 'Inventory - Sort items low to high', passed: false, error: `Expected first price "$7.99", got "${firstPrice}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Inventory - Sort items low to high', passed: false, error: String(e) });
  }

  // Test 6: Sort items by name A to Z
  try {
    await prepareInventory(driver, baseUrl);
    await driver.wait(until.elementLocated(By.css('.product_sort_container')), WAIT);
    const select = await driver.findElement(By.css('.product_sort_container'));
    await driver.executeScript('arguments[0].value = "az"; arguments[0].dispatchEvent(new Event("change", { bubbles: true }));', select);
    await driver.sleep(500);
    const firstName = await driver.findElement(By.css('.inventory_item_name')).getText();
    if (firstName.includes('Backpack')) {
      testResults.push({ name: 'Inventory - Sort items A to Z', passed: true });
    } else {
      testResults.push({ name: 'Inventory - Sort items A to Z', passed: false, error: `Expected "Backpack", got "${firstName}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Inventory - Sort items A to Z', passed: false, error: String(e) });
  }

  return testResults;
}
