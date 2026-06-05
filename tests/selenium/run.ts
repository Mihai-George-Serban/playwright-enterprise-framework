import path from 'path';
import os from 'os';
import fs from 'fs';
import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { loginTests } from './login.spec';
import { Key } from 'selenium-webdriver';
import { inventoryTests } from './inventory.spec';
import { cartTests } from './cart.spec';
import { checkoutTests } from './checkout.spec';
import { navigationTests } from './navigation.spec';
import { accessibilityTests } from './accessibility.spec';
import { visualRegressionTests } from './visual-regression.spec';
import { apiTests } from './api.spec';

const BASE_URL = 'https://www.saucedemo.com';

// Create a temporary directory for Chrome user data to avoid password manager popups
function getTempChromeDataDir(): string {
  const tempDir = path.join(os.tmpdir(), `chrome-test-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}

function getCredentials(): { username: string; password: string; source: string } {
  const envUser = process.env.SELENIUM_USER;
  const envPass = process.env.SELENIUM_PASS;
  if (envUser && envPass) {
    return { username: envUser, password: envPass, source: 'env' };
  }
  // fall back to public demo credentials
  return { username: 'standard_user', password: 'secret_sauce', source: 'default' };
}

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.substring(prefix.length) : undefined;
}

function parseFlag(name: string): boolean {
  return process.argv.slice(2).some((item) => item === `--${name}`);
}

function safeRequire(moduleName: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(moduleName);
  } catch {
    return null;
  }
}

function ensureDriverPath(browser: string) {
  if (browser === 'chrome') {
    const chromeDriver = safeRequire('chromedriver');
    if (chromeDriver?.path) {
      process.env.PATH = `${path.dirname(chromeDriver.path)}${path.delimiter}${process.env.PATH ?? ''}`;
    }
  }

}

async function tryDismissPasswordPopup(driver: WebDriver) {
  try {
    // 1) Send Escape key - often closes dialogs
    await driver.actions().sendKeys(Key.ESCAPE).perform();
  } catch {
    // ignore
  }

  try {
    // 2) Send Tab then Enter to activate any focused accept button
    await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
  } catch {
    // ignore
  }

    try {
    // 3) As a last resort, try clicking near the top-right area of the viewport
    //    This is a heuristic; coordinates may need tuning per environment.
    const dims: any = await driver.executeScript('return {w: window.innerWidth, h: window.innerHeight};');
    const x = Math.max(10, Math.floor(dims.w - 120));
    const y = Math.max(10, 80);
    // Use DOM click via elementFromPoint to avoid TS input origin typing issues
    await driver.executeScript('const el = document.elementFromPoint(arguments[0], arguments[1]); if (el) el.click();', x, y);
  } catch {
    // ignore
  }
}

function buildDriver(browser: string, headless: boolean): Promise<WebDriver> {
  if (browser !== 'chrome') {
    throw new Error(`Unsupported browser: ${browser}. Selenium tests are configured for Chrome only.`);
  }

  ensureDriverPath(browser);
  const builder = new Builder().forBrowser(browser);

  if (browser === 'chrome') {
    const options = new chrome.Options();
    if (headless) options.addArguments('--headless=new');
    
    // Use a temporary user data directory to avoid password manager/breach popups
    const tempChromeDir = getTempChromeDataDir();
    options.addArguments(`--user-data-dir=${tempChromeDir}`);
    
    // Aggressively disable Chrome's password manager, autofill, and breach detection UI
    options.addArguments(
      '--disable-blink-features=AutomationControlled',
      '--disable-save-password-bubble',
      '--disable-password-manager-reauthentication',
      '--disable-component-extensions-with-background-pages',
      '--disable-features=PasswordSaving,PasswordBreachDetection,PasswordGenerator,PasswordFilling,PasswordsUIRefresh,PasswordsInSettings,TranslateUIBrowser,CredentialProviderService,AutofillSaveFormPopup,PasswordManagerOnboardingUI,PasswordManagerAutoSignin,AutofillServerCommunication,AutofillProfileEnabled,AutofillCreditCardEnabled,PasswordManager',
      '--password-store=basic',
      '--safebrowsing-disable-auto-update',
      '--safebrowsing-disable-download-protection',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-gcm',
      '--disable-google-cloud-messaging',
      '--disable-infobars',
      '--disable-popup-blocking',
      '--disable-notifications',
      '--disable-sync',
      '--disable-default-apps',
      '--disable-client-side-phishing-detection',
      '--disable-password-manager',
      '--disable-features=TranslateUI'
    );
    
    // Set Chrome user preferences to fully disable credentials service and password manager
    try {
      options.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false,
        'password_manager_enabled': false,
        'browser.enable_automatic_password_manager': false,
        'autofill.profile_enabled': false,
        'autofill.credit_card_enabled': false,
        'profile.default_content_setting_values.notifications': 2,
        'profile.default_content_setting_values.popups': 0,
        'profile.managed_default_content_settings.popups': 0,
        'profile.managed_default_content_settings.notifications': 2,
        'safebrowsing.enabled': false
      });
    } catch {
      // ignore if the API isn't available
    }
    // Add extra variants to cover different Chrome versions and feature names
    options.addArguments(
      '--disable-features=PasswordLeakDetection,PasswordLeakWarning,CredentialLeakDetection,PasswordLeakWarningUI,PasswordBreachDetectionUI'
    );
    
    builder.setChromeOptions(options);
  }

  return builder.build();
}

async function waitForElement(driver: WebDriver, locator: By, timeout = 10000): Promise<WebElement> {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function getElementText(driver: WebDriver, locator: By): Promise<string> {
  const el = await waitForElement(driver, locator);
  return await el.getText();
}

async function isDisplayed(driver: WebDriver, locator: By): Promise<boolean> {
  try {
    const el = await driver.findElement(locator);
    return await el.isDisplayed();
  } catch {
    return false;
  }
}

async function findFinishButton(driver: WebDriver): Promise<WebElement> {
  const selectors = [
    By.css('[data-test="finish"]'),
    By.id('finish'),
    By.xpath("//button[contains(., 'Finish')]")
  ];

  for (const selector of selectors) {
    try {
      const el = await driver.wait(until.elementLocated(selector), 15000);
      await driver.wait(until.elementIsVisible(el), 10000);
      return el;
    } catch {
      // try next selector
    }
  }

  const footButtons = await driver.findElements(By.css('button'));
  for (const button of footButtons) {
    const text = await button.getText();
    if (text.toLowerCase().includes('finish')) {
      return button;
    }
  }

  throw new Error('Finish button not found');
}

async function performLogin(driver: WebDriver, username?: string, password?: string) {
  const creds = getCredentials();
  const userToUse = username ?? creds.username;
  const passToUse = password ?? creds.password;

  if (creds.source === 'env') {
    // do not log secrets; only indicate that env creds are used
    console.log('Using Selenium credentials from environment variables');
  } else {
    console.log('Using default demo credentials for login');
  }

  await driver.get(BASE_URL);
  await driver.findElement(By.id('user-name')).sendKeys(userToUse);
  await driver.findElement(By.id('password')).sendKeys(passToUse);
  await driver.findElement(By.id('login-button')).click();
  await driver.wait(until.urlContains('inventory.html'), 10000).catch(() => null);
}

async function loginTest(driver: WebDriver) {
  await performLogin(driver);
  const pageTitle = await getElementText(driver, By.className('title'));
  return pageTitle === 'Products';
}

async function invalidLoginTest(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.findElement(By.id('user-name')).sendKeys('invalid_user');
  await driver.findElement(By.id('password')).sendKeys('wrong_password');
  await driver.findElement(By.id('login-button')).click();
  const errorText = await getElementText(driver, By.css('[data-test="error"]'));
  return errorText.includes('Username and password') || errorText.includes('do not match') || errorText.includes('locked out');
}

async function lockedOutUserTest(driver: WebDriver) {
  await driver.get(BASE_URL);
  await driver.findElement(By.id('user-name')).sendKeys('locked_out_user');
  await driver.findElement(By.id('password')).sendKeys('secret_sauce');
  await driver.findElement(By.id('login-button')).click();
  const errorText = await getElementText(driver, By.css('[data-test="error"]'));
  return errorText.includes('locked out');
}

async function problemUserLoginTest(driver: WebDriver) {
  await performLogin(driver, 'problem_user', 'secret_sauce');
  const items = await driver.findElements(By.className('inventory_item'));
  return items.length === 6;
}

async function inventoryTest(driver: WebDriver) {
  await performLogin(driver);
  const items = await driver.findElements(By.className('inventory_item'));
  return items.length === 6;
}

async function inventoryItemNamesTest(driver: WebDriver) {
  await performLogin(driver);
  const names = await driver.findElements(By.className('inventory_item_name'));
  if (names.length !== 6) return false;
  const firstName = await names[0].getText();
  const lastName = await names[names.length - 1].getText();
  return firstName.length > 0 && lastName.length > 0 && firstName.includes('Sauce Labs') && lastName.includes('T-Shirt');
}

async function inventoryPricesTest(driver: WebDriver) {
  await performLogin(driver);
  const prices = await driver.findElements(By.className('inventory_item_price'));
  if (prices.length !== 6) return false;
  for (const price of prices) {
    const value = Number((await price.getText()).replace('$', '').trim());
    if (Number.isNaN(value) || value <= 0) return false;
  }
  return true;
}

async function productImageVisibilityTest(driver: WebDriver) {
  await performLogin(driver);
  const images = await driver.findElements(By.css('.inventory_item_img img'));
  if (images.length !== 6) return false;
  for (const image of images) {
    if (!(await image.isDisplayed())) return false;
  }
  return true;
}

async function addToCartTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  const badgeText = await getElementText(driver, By.className('shopping_cart_badge'));
  return badgeText === '1';
}

async function addTwoItemsTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.id('add-to-cart-sauce-labs-bike-light')).click();
  const badgeText = await getElementText(driver, By.className('shopping_cart_badge'));
  return badgeText === '2';
}

async function cartTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  const cartItems = await driver.findElements(By.className('cart_item'));
  return cartItems.length === 1;
}

async function removeFromCartTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  await driver.findElement(By.id('remove-sauce-labs-backpack')).click();
  const cartItems = await driver.findElements(By.className('cart_item'));
  return cartItems.length === 0;
}

async function removeOneItemTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.id('add-to-cart-sauce-labs-bike-light')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  await driver.findElement(By.id('remove-sauce-labs-backpack')).click();
  const badge = await driver.findElements(By.className('shopping_cart_badge'));
  return badge.length > 0 && (await badge[0].getText()) === '1';
}

async function continueShoppingTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  await driver.findElement(By.id('continue-shopping')).click();
  const url = await driver.getCurrentUrl();
  return url.includes('inventory.html');
}

async function cancelCheckoutTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  await driver.findElement(By.css('[data-test="checkout"]')).click();
  await driver.wait(until.urlContains('checkout-step-one.html'), 5000);
  await driver.findElement(By.css('[data-test="cancel"]')).click();
  const url = await driver.getCurrentUrl();
  return url.includes('cart.html');
}

async function checkoutTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  await driver.findElement(By.css('[data-test="checkout"]')).click();

  // Wait for checkout step one
  await driver.wait(until.urlContains('checkout-step-one'), 5000);
  const firstNameInput = await waitForElement(driver, By.id('first-name'));
  await firstNameInput.sendKeys('Jane');
  const lastNameInput = await driver.findElement(By.id('last-name'));
  await lastNameInput.sendKeys('Doe');
  const postalInput = await driver.findElement(By.id('postal-code'));
  await postalInput.sendKeys('12345');
  const continueBtn = await driver.findElement(By.css('[data-test="continue"]'));
  await driver.wait(until.elementIsVisible(continueBtn), 5000).catch(() => null);
  await driver.wait(until.elementIsEnabled(continueBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', continueBtn);

  // After continuing, wait for checkout-step-two or complete-header
  await driver.wait(
    until.urlMatches(/checkout-step-two|checkout-complete/),
    15000
  ).catch(() => null);
  await driver.sleep(1000);

  // Check if already complete
  try {
    await driver.wait(until.elementLocated(By.className('complete-header')), 2000);
    const complete = await driver.findElement(By.className('complete-header'));
    return await complete.isDisplayed();
  } catch {
    // Not complete yet; try to find and click the Finish button.
  }

  // Try to find and click finish button with retry
  let finishBtn;
  try {
    finishBtn = await findFinishButton(driver);
  } catch (err) {
    // If finish button not found after first attempt, wait a bit and retry
    await driver.sleep(1000);
    finishBtn = await findFinishButton(driver);
  }

  await driver.executeScript('arguments[0].click();', finishBtn);
  await driver.sleep(500); // allow page transition

  const complete = await waitForElement(driver, By.className('complete-header'), 10000);
  return await complete.isDisplayed();
}

async function finishCheckoutTest(driver: WebDriver) {
  return checkoutTest(driver);
}

async function productDetailsTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.css('[data-test="item-4-title-link"]')).click();
  await driver.wait(until.urlContains('inventory-item'), 5000);
  return await isDisplayed(driver, By.className('inventory_details_name'));
}

async function productDetailsBackTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.css('[data-test="item-4-title-link"]')).click();
  await driver.wait(until.urlContains('inventory-item'), 5000);
  await driver.findElement(By.css('[data-test="back-to-products"]')).click();
  const url = await driver.getCurrentUrl();
  return url.includes('inventory.html');
}

async function logoutTest(driver: WebDriver) {
  await performLogin(driver);
  const menuBtn = await waitForElement(driver, By.id('react-burger-menu-btn'));
  await driver.wait(until.elementIsVisible(menuBtn), 5000).catch(() => null);
  await driver.wait(until.elementIsEnabled(menuBtn), 5000).catch(() => null);
  // use JS click to avoid overlay/interactability issues
  await driver.executeScript('arguments[0].click();', menuBtn);
  const logoutLink = await waitForElement(driver, By.id('logout_sidebar_link'));
  await driver.wait(until.elementIsVisible(logoutLink), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', logoutLink);
  await driver.wait(async () => (await driver.getCurrentUrl()).includes(BASE_URL), 15000).catch(() => null);
  return await isDisplayed(driver, By.id('login-button'));
}

async function sidebarOpenTest(driver: WebDriver) {
  await performLogin(driver);
  const menuBtn = await waitForElement(driver, By.id('react-burger-menu-btn'));
  await driver.wait(until.elementIsVisible(menuBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', menuBtn);
  const menu = await waitForElement(driver, By.css('.bm-item-list'));
  // wait for menu contents to populate
  await driver.wait(async () => {
    const t = await menu.getText().catch(() => '');
    return t.includes('All Items') && t.includes('About') && t.includes('Logout') && t.includes('Reset App State');
  }, 5000).catch(() => null);
  const text = await menu.getText();
  return text.includes('All Items') && text.includes('About') && text.includes('Logout') && text.includes('Reset App State');
}

async function resetAppStateTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  const menuBtn = await waitForElement(driver, By.id('react-burger-menu-btn'));
  await driver.wait(until.elementIsVisible(menuBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', menuBtn);
  const resetLink = await waitForElement(driver, By.id('reset_sidebar_link'));
  await driver.wait(until.elementIsVisible(resetLink), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', resetLink);
  const badge = await driver.findElements(By.className('shopping_cart_badge'));
  return badge.length === 0;
}

async function aboutLinkTest(driver: WebDriver) {
  await performLogin(driver);
  const menuBtn = await waitForElement(driver, By.id('react-burger-menu-btn'));
  await driver.wait(until.elementIsVisible(menuBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', menuBtn);
  const aboutLink = await waitForElement(driver, By.id('about_sidebar_link'));
  const href = await aboutLink.getAttribute('href');
  return typeof href === 'string' && href.includes('saucelabs.com');
}

async function menuCloseTest(driver: WebDriver) {
  await performLogin(driver);
  const menuBtn = await waitForElement(driver, By.id('react-burger-menu-btn'));
  await driver.wait(until.elementIsVisible(menuBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', menuBtn);
  const closeBtn = await waitForElement(driver, By.id('react-burger-cross-btn'));
  await driver.wait(until.elementIsVisible(closeBtn), 5000).catch(() => null);
  await driver.executeScript('arguments[0].click();', closeBtn);
  await driver.wait(async () => {
    try {
      const button = await driver.findElement(By.id('react-burger-cross-btn'));
      return !(await button.isDisplayed());
    } catch {
      return true;
    }
  }, 5000);
  const overlayVisible = await driver.findElements(By.css('.bm-overlay'))
    .then((els) => Promise.all(els.map((el) => el.isDisplayed())))
    .then((states) => states.some((visible) => visible));
  return !overlayVisible;
}

async function cartItemDetailsTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
  await driver.findElement(By.className('shopping_cart_link')).click();
  await driver.wait(until.urlContains('cart.html'), 5000);
  const name = await getElementText(driver, By.css('.cart_item .inventory_item_name'));
  const price = await getElementText(driver, By.css('.cart_item .inventory_item_price'));
  return name.includes('Sauce Labs Backpack') && price.includes('$29.99');
}

async function footerVisibleTest(driver: WebDriver) {
  await performLogin(driver);
  const footer = await waitForElement(driver, By.css('.footer'));
  const text = await footer.getText();
  return text.includes('Sauce Labs');
}

async function sortTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.className('product_sort_container')).click();
  await driver.findElement(By.css('.product_sort_container option[value="lohi"]')).click();
  const prices = await driver.findElements(By.className('inventory_item_price'));
  const vals = [] as number[];
  for (const p of prices) {
    const txt = await p.getText();
    vals.push(Number(txt.replace('$', '').trim()));
  }
  const sorted = [...vals].sort((a, b) => a - b);
  return JSON.stringify(vals) === JSON.stringify(sorted);
}

async function sortHiloTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.className('product_sort_container')).click();
  await driver.findElement(By.css('.product_sort_container option[value="hilo"]')).click();
  const firstPrice = await getElementText(driver, By.className('inventory_item_price'));
  return firstPrice.includes('$49.99');
}

async function sortAzTest(driver: WebDriver) {
  await performLogin(driver);
  await driver.findElement(By.className('product_sort_container')).click();
  await driver.findElement(By.css('.product_sort_container option[value="az"]')).click();
  const firstName = await getElementText(driver, By.className('inventory_item_name'));
  return firstName.includes('Sauce Labs Backpack');
}

async function socialLinksTest(driver: WebDriver) {
  await performLogin(driver);
  const twitter = await isDisplayed(driver, By.css('.social_twitter'));
  const facebook = await isDisplayed(driver, By.css('.social_facebook'));
  const linkedin = await isDisplayed(driver, By.css('.social_linkedin'));
  return twitter && facebook && linkedin;
}

async function runSelectedTests(browser: string, headless: boolean, selected: string[]) {
  const results: { name: string; passed: boolean }[] = [];

  for (const test of selected) {
    const driver = await buildDriver(browser, headless);
    try {
      // helper to run a test with one retry after attempting to dismiss the Chrome password popup
      async function runWithRetry(exec: () => Promise<boolean>, displayName: string) {
        try {
          await tryDismissPasswordPopup(driver);
          return await exec();
        } catch (err) {
          // retry once after attempting to dismiss the popup
          try {
            await tryDismissPasswordPopup(driver);
            await new Promise((r) => setTimeout(r, 500));
            return await exec();
          } catch (err2) {
            // take screenshot for debugging
            try {
              const img = await driver.takeScreenshot();
              const dir = path.join(process.cwd(), 'test-results', 'selenium-popups');
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              const file = path.join(dir, `${displayName.replace(/[^a-z0-9_-]/gi, '_')}-${Date.now()}.png`);
              fs.writeFileSync(file, img, 'base64');
              console.error(`Saved failure screenshot: ${file}`);
            } catch (sErr) {
              console.error('Failed to capture screenshot after popup retry', sErr);
            }
            throw err2;
          }
        }
      }

      if (test === 'login-suite') {
        const testResults = await loginTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'inventory-suite') {
        const testResults = await inventoryTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'cart-suite') {
        const testResults = await cartTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'checkout-suite') {
        const testResults = await checkoutTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'navigation-suite') {
        const testResults = await navigationTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'accessibility-suite') {
        const testResults = await accessibilityTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
        }
      } else if (test === 'visual-regression-suite') {
        const screenshotDir = path.join(process.cwd(), 'test-results', 'selenium-screenshots');
        const testResults = await visualRegressionTests(driver, BASE_URL, screenshotDir);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
          if (!result.passed && result.error) {
            console.error(`  Error: ${result.error}`);
          }
        }
      } else if (test === 'api-suite') {
        const testResults = await apiTests(driver, BASE_URL);
        results.push(...testResults);
        for (const result of testResults) {
          console.log(`${result.passed ? '✓' : '✗'} ${result.name}`);
        }
      } else {
        let passed = false;
        switch (test) {
          case 'login':
            passed = await runWithRetry(() => loginTest(driver), 'login');
            break;
          case 'invalid-login':
            passed = await runWithRetry(() => invalidLoginTest(driver), 'invalid-login');
            break;
          case 'locked-out':
            passed = await runWithRetry(() => lockedOutUserTest(driver), 'locked-out');
            break;
          case 'problem-user-login':
            passed = await runWithRetry(() => problemUserLoginTest(driver), 'problem-user-login');
            break;
          case 'inventory':
            passed = await runWithRetry(() => inventoryTest(driver), 'inventory');
            break;
          case 'inventory-item-names':
            passed = await runWithRetry(() => inventoryItemNamesTest(driver), 'inventory-item-names');
            break;
          case 'inventory-item-prices':
            passed = await runWithRetry(() => inventoryPricesTest(driver), 'inventory-item-prices');
            break;
          case 'product-image-visibility':
            passed = await runWithRetry(() => productImageVisibilityTest(driver), 'product-image-visibility');
            break;
          case 'add-to-cart':
            passed = await runWithRetry(() => addToCartTest(driver), 'add-to-cart');
            break;
          case 'add-two-items':
            passed = await runWithRetry(() => addTwoItemsTest(driver), 'add-two-items');
            break;
          case 'cart':
            passed = await runWithRetry(() => cartTest(driver), 'cart');
            break;
          case 'remove-from-cart':
            passed = await runWithRetry(() => removeFromCartTest(driver), 'remove-from-cart');
            break;
          case 'remove-one-item':
            passed = await runWithRetry(() => removeOneItemTest(driver), 'remove-one-item');
            break;
          case 'continue-shopping':
            passed = await runWithRetry(() => continueShoppingTest(driver), 'continue-shopping');
            break;
          case 'cancel-checkout':
            passed = await runWithRetry(() => cancelCheckoutTest(driver), 'cancel-checkout');
            break;
          case 'checkout':
            passed = await runWithRetry(() => checkoutTest(driver), 'checkout');
            break;
          case 'finish-checkout':
            passed = await runWithRetry(() => finishCheckoutTest(driver), 'finish-checkout');
            break;
          case 'product-details':
            passed = await runWithRetry(() => productDetailsTest(driver), 'product-details');
            break;
          case 'product-details-back':
            passed = await runWithRetry(() => productDetailsBackTest(driver), 'product-details-back');
            break;
          case 'logout':
            passed = await runWithRetry(() => logoutTest(driver), 'logout');
            break;
          case 'sidebar-open':
            passed = await runWithRetry(() => sidebarOpenTest(driver), 'sidebar-open');
            break;
          case 'reset-app-state':
            passed = await runWithRetry(() => resetAppStateTest(driver), 'reset-app-state');
            break;
          case 'about-link':
            passed = await runWithRetry(() => aboutLinkTest(driver), 'about-link');
            break;
          case 'menu-close':
            passed = await runWithRetry(() => menuCloseTest(driver), 'menu-close');
            break;
          case 'cart-item-details':
            passed = await runWithRetry(() => cartItemDetailsTest(driver), 'cart-item-details');
            break;
          case 'footer-visible':
            passed = await runWithRetry(() => footerVisibleTest(driver), 'footer-visible');
            break;
          case 'sort':
            passed = await runWithRetry(() => sortTest(driver), 'sort');
            break;
          case 'sort-hilo':
            passed = await runWithRetry(() => sortHiloTest(driver), 'sort-hilo');
            break;
          case 'sort-az':
            passed = await runWithRetry(() => sortAzTest(driver), 'sort-az');
            break;
          case 'social-links':
            passed = await runWithRetry(() => socialLinksTest(driver), 'social-links');
            break;
          default:
            throw new Error(`Unknown Selenium test: ${test}`);
        }
        results.push({ name: test, passed });
        console.log(`${passed ? '✓' : '✗'} ${test}`);
      }
    } finally {
      await driver.quit();
    }
  }

  const failed = results.filter((result) => !result.passed);
  if (failed.length > 0) {
    throw new Error(`Selenium tests failed: ${failed.map((item) => item.name).join(', ')}`);
  }
}

async function main() {
  const selectedTests = parseArg('test') || 'all';
  const browser = parseArg('browser') || 'chrome';
  const headless = parseFlag('headless');

  const allTests = [
    'login',
    'invalid-login',
    'locked-out',
    'problem-user-login',
    'inventory',
    'inventory-item-names',
    'inventory-item-prices',
    'product-image-visibility',
    'add-to-cart',
    'add-two-items',
    'cart',
    'remove-from-cart',
    'remove-one-item',
    'continue-shopping',
    'cancel-checkout',
    'checkout',
    'finish-checkout',
    'product-details',
    'product-details-back',
    'logout',
    'sidebar-open',
    'reset-app-state',
    'about-link',
    'menu-close',
    'cart-item-details',
    'footer-visible',
    'sort',
    'sort-hilo',
    'sort-az',
    'social-links',
    'login-suite',
    'inventory-suite',
    'cart-suite',
    'checkout-suite',
    'navigation-suite',
    'accessibility-suite',
    'visual-regression-suite',
    'api-suite'
  ];
  const testsToRun = selectedTests === 'all' ? allTests : selectedTests.split(',');

  console.log('Selenium runner starting with:');
  console.log(`  browser=${browser}`);
  console.log(`  headless=${headless}`);
  console.log(`  tests=${testsToRun.join(',')}`);

  await runSelectedTests(browser, headless, testsToRun);
}

main().catch((error) => {
  console.error('Selenium run failed:', error);
  process.exit(1);
});
