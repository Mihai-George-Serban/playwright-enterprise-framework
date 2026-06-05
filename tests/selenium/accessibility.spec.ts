import { WebDriver, By, until } from 'selenium-webdriver';

async function login(driver: WebDriver, baseUrl: string, username: string, password: string) {
  await driver.get(baseUrl + '/');
  await driver.wait(until.elementLocated(By.id('user-name')), 5000);
  await driver.findElement(By.id('user-name')).sendKeys(username);
  await driver.findElement(By.id('password')).sendKeys(password);
  await driver.findElement(By.id('login-button')).click();
  await driver.wait(until.urlContains('/inventory'), 5000);
}

export async function accessibilityTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Login form has accessible placeholders
  try {
    await driver.get(baseUrl + '/');
    const usernamePlaceholder = await driver.findElement(By.id('user-name')).getAttribute('placeholder');
    const passwordPlaceholder = await driver.findElement(By.id('password')).getAttribute('placeholder');
    if (usernamePlaceholder === 'Username' && passwordPlaceholder === 'Password') {
      testResults.push({ name: 'Accessibility - Login form placeholders', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Login form placeholders', passed: false, error: 'Missing placeholders' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Login form placeholders', passed: false, error: String(e) });
  }

  // Test 2: Login button is accessible
  try {
    await driver.get(baseUrl + '/');
    const button = await driver.findElement(By.id('login-button'));
    const type = await button.getAttribute('type');
    if (type === 'submit') {
      testResults.push({ name: 'Accessibility - Login button accessible', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Login button accessible', passed: false, error: 'Button type is not submit' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Login button accessible', passed: false, error: String(e) });
  }

  // Test 3: Error messages are visible
  try {
    await driver.get(baseUrl + '/');
    await driver.findElement(By.id('login-button')).click();
    const errorElement = await driver.wait(until.elementLocated(By.css('[data-test="error"]')), 5000);
    const isDisplayed = await errorElement.isDisplayed();
    if (isDisplayed) {
      testResults.push({ name: 'Accessibility - Error messages visible', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Error messages visible', passed: false, error: 'Error not displayed' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Error messages visible', passed: false, error: String(e) });
  }

  // Test 4: Inventory items are visible and accessible
  try {
    await login(driver, baseUrl, 'standard_user', 'secret_sauce');
    const items = await driver.findElements(By.css('.inventory_item_name'));
    if (items.length === 6) {
      let allVisible = true;
      for (const item of items) {
        if (!(await item.isDisplayed())) {
          allVisible = false;
          break;
        }
      }
      if (allVisible) {
        testResults.push({ name: 'Accessibility - Inventory items accessible', passed: true });
      } else {
        testResults.push({ name: 'Accessibility - Inventory items accessible', passed: false, error: 'Some items not visible' });
      }
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Inventory items accessible', passed: false, error: String(e) });
  }

  // Test 5: Sort dropdown is accessible
  try {
    await driver.get(baseUrl + '/inventory.html');
    const select = await driver.findElement(By.css('.product_sort_container'));
    const isDisplayed = await select.isDisplayed();
    if (isDisplayed) {
      testResults.push({ name: 'Accessibility - Sort dropdown accessible', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Sort dropdown accessible', passed: false, error: 'Dropdown not visible' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Sort dropdown accessible', passed: false, error: String(e) });
  }

  // Test 6: Product images are accessible
  try {
    await driver.get(baseUrl + '/inventory.html');
    const images = await driver.findElements(By.css('.inventory_item_img img'));
    if (images.length >= 6) {
      let allHaveSrc = true;
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (!src) {
          allHaveSrc = false;
          break;
        }
      }
      if (allHaveSrc) {
        testResults.push({ name: 'Accessibility - Product images accessible', passed: true });
      } else {
        testResults.push({ name: 'Accessibility - Product images accessible', passed: false, error: 'Some images missing src' });
      }
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Product images accessible', passed: false, error: String(e) });
  }

  // Test 7: Checkout form fields are accessible
  try {
    await login(driver, baseUrl, 'standard_user', 'secret_sauce');
    await driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]')).click();
    await driver.findElement(By.css('.shopping_cart_link')).click();
    await driver.findElement(By.css('[data-test="checkout"]')).click();
    await driver.wait(until.urlContains('/checkout-step-one'), 5000);
    const firstNameField = await driver.findElement(By.css('[data-test="firstName"]'));
    const lastNameField = await driver.findElement(By.css('[data-test="lastName"]'));
    const postalCodeField = await driver.findElement(By.css('[data-test="postalCode"]'));
    if (await firstNameField.isDisplayed() && await lastNameField.isDisplayed() && await postalCodeField.isDisplayed()) {
      testResults.push({ name: 'Accessibility - Checkout form fields accessible', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Checkout form fields accessible', passed: false, error: 'Some fields not visible' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Checkout form fields accessible', passed: false, error: String(e) });
  }

  // Test 8: Menu is accessible
  try {
    await driver.get(baseUrl + '/inventory.html');
    const menuButton = await driver.findElement(By.id('react-burger-menu-btn'));
    if (await menuButton.isDisplayed()) {
      testResults.push({ name: 'Accessibility - Menu button accessible', passed: true });
    } else {
      testResults.push({ name: 'Accessibility - Menu button accessible', passed: false, error: 'Menu button not visible' });
    }
  } catch (e) {
    testResults.push({ name: 'Accessibility - Menu button accessible', passed: false, error: String(e) });
  }

  return testResults;
}
