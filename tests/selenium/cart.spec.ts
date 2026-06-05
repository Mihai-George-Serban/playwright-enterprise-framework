import { WebDriver, By, until } from 'selenium-webdriver';

const WAIT = 10000;

async function clickWhenReady(driver: WebDriver, locator: any, timeout = 10000) {
  const el = await driver.wait(until.elementLocated(locator), timeout);
  try {
    await driver.wait(until.elementIsVisible(el), WAIT);
    await el.click();
  } catch (e) {
    try {
      await driver.executeScript('arguments[0].click();', el);
    } catch (e2) {
      throw e2;
    }
  }
  return el;
}

async function login(driver: WebDriver, baseUrl: string, username: string, password: string) {
  await driver.get(baseUrl + '/');
  await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
  await driver.findElement(By.id('user-name')).sendKeys(username);
  await driver.findElement(By.id('password')).sendKeys(password);
  await driver.findElement(By.id('login-button')).click();
  await driver.wait(until.urlContains('/inventory'), WAIT);
}

async function resetAppState(driver: WebDriver) {
  try {
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const resetLink = await driver.wait(until.elementLocated(By.id('reset_sidebar_link')), WAIT);
    await driver.executeScript('arguments[0].click();', resetLink);
    await driver.wait(async () => {
      const badges = await driver.findElements(By.css('.shopping_cart_badge'));
      return badges.length === 0;
    }, WAIT);
  } catch {
    // ignore if app is already clean or reset is unavailable
  }
}

async function prepareCart(driver: WebDriver, baseUrl: string) {
  await login(driver, baseUrl, 'standard_user', 'secret_sauce');
  await resetAppState(driver);
  await driver.get(baseUrl + '/inventory.html');
}

export async function cartTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Add items and update cart count
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-bike-light'));
    const badge = await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT).then((el) => el.getText());
    if (badge === '2') {
      testResults.push({ name: 'Cart - Add two items', passed: true });
    } else {
      testResults.push({ name: 'Cart - Add two items', passed: false, error: `Expected badge "2", got "${badge}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Cart - Add two items', passed: false, error: String(e) });
  }

  // Test 2: View cart
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-bike-light'));
    await clickWhenReady(driver, By.css('.shopping_cart_link'));
    await driver.wait(until.urlContains('/cart'), WAIT);
    const cartItems = await driver.findElements(By.css('.cart_item'));
    if (cartItems.length === 2) {
      testResults.push({ name: 'Cart - View cart', passed: true });
    } else {
      testResults.push({ name: 'Cart - View cart', passed: false, error: `Expected 2 items, got ${cartItems.length}` });
    }
  } catch (e) {
    testResults.push({ name: 'Cart - View cart', passed: false, error: String(e) });
  }

  // Test 3: Remove item from cart
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-bike-light'));
    await clickWhenReady(driver, By.css('.shopping_cart_link'));
    await driver.wait(until.urlContains('/cart'), WAIT);
    await clickWhenReady(driver, By.id('remove-sauce-labs-backpack'));
    const badge = await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT).then((el) => el.getText());
    if (badge === '1') {
      testResults.push({ name: 'Cart - Remove item', passed: true });
    } else {
      testResults.push({ name: 'Cart - Remove item', passed: false, error: `Expected badge "1", got "${badge}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Cart - Remove item', passed: false, error: String(e) });
  }

  // Test 4: Continue shopping
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await clickWhenReady(driver, By.css('.shopping_cart_link'));
    await driver.wait(until.urlContains('/cart'), WAIT);
    await clickWhenReady(driver, By.id('continue-shopping'));
    await driver.wait(until.urlContains('/inventory'), WAIT);
    testResults.push({ name: 'Cart - Continue shopping', passed: true });
  } catch (e) {
    testResults.push({ name: 'Cart - Continue shopping', passed: false, error: String(e) });
  }

  // Test 5: Cart persists after refresh
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await driver.navigate().refresh();
    const badgeText = await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT).then((el) => el.getText());
    if (badgeText === '1') {
      testResults.push({ name: 'Cart - Persist after refresh', passed: true });
    } else {
      testResults.push({ name: 'Cart - Persist after refresh', passed: false, error: `Expected badge "1", got "${badgeText}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Cart - Persist after refresh', passed: false, error: String(e) });
  }

  // Test 6: View item details in cart
  try {
    await prepareCart(driver, baseUrl);
    await clickWhenReady(driver, By.id('add-to-cart-sauce-labs-backpack'));
    await clickWhenReady(driver, By.css('.shopping_cart_link'));
    await driver.wait(until.urlContains('/cart'), WAIT);
    const itemName = await driver.wait(until.elementLocated(By.css('.cart_item_label .inventory_item_name')), WAIT).then((el) => el.getText());
    if (itemName.includes('Backpack')) {
      testResults.push({ name: 'Cart - View item details', passed: true });
    } else {
      testResults.push({ name: 'Cart - View item details', passed: false, error: `Expected "Backpack", got "${itemName}"` });
    }
  } catch (e) {
    testResults.push({ name: 'Cart - View item details', passed: false, error: String(e) });
  }

  return testResults;
}

