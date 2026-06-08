import { WebDriver, By, until } from 'selenium-webdriver';
import { WAIT, login, resetAppState } from './helpers';

async function prepareNavigation(driver: WebDriver, baseUrl: string) {
  await login(driver, baseUrl, 'standard_user', 'secret_sauce');
  await resetAppState(driver);
  await driver.get(baseUrl + '/inventory.html');
}

export async function navigationTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Display menu items
  try {
    await prepareNavigation(driver, baseUrl);
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const allItemsLink = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'All Items')]")), WAIT);
    if (allItemsLink) {
      testResults.push({ name: 'Navigation - Display menu items', passed: true });
    }
  } catch (e) {
    testResults.push({ name: 'Navigation - Display menu items', passed: false, error: String(e) });
  }

  // Test 2: Logout from menu
  try {
    await prepareNavigation(driver, baseUrl);
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const logoutLink = await driver.wait(until.elementLocated(By.id('logout_sidebar_link')), WAIT);
    await driver.executeScript('arguments[0].click();', logoutLink);
    await driver.wait(until.urlContains('saucedemo.com'), WAIT);
    testResults.push({ name: 'Navigation - Logout from menu', passed: true });
  } catch (e) {
    testResults.push({ name: 'Navigation - Logout from menu', passed: false, error: String(e) });
  }

  // Test 3: Reset app state
  try {
    await prepareNavigation(driver, baseUrl);
    await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const resetLink = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Reset App State')]")), WAIT);
    await driver.executeScript('arguments[0].click();', resetLink);
    try {
      await driver.wait(until.elementLocated(By.css('.shopping_cart_badge')), WAIT);
      testResults.push({ name: 'Navigation - Reset app state', passed: false, error: 'Badge should be removed after reset' });
    } catch {
      testResults.push({ name: 'Navigation - Reset app state', passed: true });
    }
  } catch (e) {
    testResults.push({ name: 'Navigation - Reset app state', passed: false, error: String(e) });
  }

  // Test 4: Close menu
  try {
    await prepareNavigation(driver, baseUrl);
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const closeBtn = await driver.wait(until.elementLocated(By.id('react-burger-cross-btn')), WAIT);
    await driver.executeScript('arguments[0].click();', closeBtn);
    await driver.wait(async () => {
      try {
        const button = await driver.findElement(By.id('react-burger-cross-btn'));
        return !(await button.isDisplayed());
      } catch {
        return true;
      }
    }, WAIT);
    const overlayVisible = await driver.findElements(By.css('.bm-overlay'))
      .then((els) => Promise.all(els.map((el) => el.isDisplayed())))
      .then((states) => states.some((visible) => visible));
    if (overlayVisible) {
      testResults.push({ name: 'Navigation - Close menu', passed: false, error: 'Overlay remained visible after close' });
    } else {
      testResults.push({ name: 'Navigation - Close menu', passed: true });
    }
  } catch (e) {
    testResults.push({ name: 'Navigation - Close menu', passed: false, error: String(e) });
  }

  // Test 5: Navigate to About page
  try {
    await prepareNavigation(driver, baseUrl);
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const aboutLink = await driver.wait(until.elementLocated(By.id('about_sidebar_link')), WAIT);
    const href = (await aboutLink.getAttribute('href')) ?? '';
    if (href.includes('saucelabs.com')) {
      testResults.push({ name: 'Navigation - About link correct', passed: true });
    } else {
      testResults.push({ name: 'Navigation - About link correct', passed: false, error: `Expected saucelabs.com, got ${href}` });
    }
  } catch (e) {
    testResults.push({ name: 'Navigation - About link correct', passed: false, error: String(e) });
  }

  return testResults;
}
