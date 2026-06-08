import { WebDriver, By, until, WebElement, Key } from 'selenium-webdriver';

export const WAIT = 10000;

/** Set input value via JS to avoid Chrome password-manager / breach-detection hooks on sendKeys. */
export async function setInputValue(
  driver: WebDriver,
  element: WebElement,
  value: string,
  options: { password?: boolean } = {}
) {
  await driver.executeScript(
    `
    const el = arguments[0];
    const val = arguments[1];
    const isPassword = arguments[2];
    el.setAttribute('autocomplete', isPassword ? 'new-password' : 'off');
    el.setAttribute('readonly', 'true');
    el.focus();
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (setter) {
      setter.call(el, val);
    } else {
      el.value = val;
    }
    el.removeAttribute('readonly');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    `,
    element,
    value,
    Boolean(options.password)
  );
}

export async function clearAndType(
  driver: WebDriver,
  element: WebElement,
  text: string,
  options: { password?: boolean } = {}
) {
  await setInputValue(driver, element, text, options);
}

export async function prepareLoginPage(driver: WebDriver, baseUrl: string) {
  await driver.manage().deleteAllCookies();
  await driver.get(baseUrl + '/');
  await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
  await dismissChromeDialogs(driver);
}

/** Dismiss Chrome password-save / data-breach infobars that block page interaction. */
export async function submitLogin(driver: WebDriver) {
  await dismissChromeDialogs(driver);
  await driver.executeScript('document.getElementById("login-button")?.click();');
  await dismissChromeDialogs(driver);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function dismissChromeDialogs(driver: WebDriver) {
  for (let i = 0; i < 3; i++) {
    try {
      await driver.actions().sendKeys(Key.ESCAPE).perform();
    } catch {
      // ignore
    }
  }

  try {
    await driver.actions().sendKeys(Key.TAB, Key.ENTER).perform();
  } catch {
    // ignore
  }

  try {
    await driver.executeScript(`
      const labels = ['not now', 'no thanks', 'dismiss', 'never', 'ok', 'close', 'got it'];
      const nodes = [...document.querySelectorAll('button, [role="button"]')];
      for (const node of nodes) {
        const text = (node.textContent || '').trim().toLowerCase();
        if (labels.some((label) => text === label || text.includes(label))) {
          node.click();
          break;
        }
      }
    `);
  } catch {
    // ignore
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
}

export async function login(
  driver: WebDriver,
  baseUrl: string,
  username: string,
  password: string,
  wait = WAIT
) {
  await prepareLoginPage(driver, baseUrl);
  const userEl = await driver.wait(until.elementLocated(By.id('user-name')), wait);
  const passEl = await driver.findElement(By.id('password'));
  await setInputValue(driver, userEl, username);
  await setInputValue(driver, passEl, password, { password: true });
  await submitLogin(driver);
  await driver.wait(until.urlContains('/inventory'), wait);
}

export async function getLoginErrorText(driver: WebDriver, wait = WAIT) {
  await dismissChromeDialogs(driver);

  const url = await driver.getCurrentUrl();
  if (url.includes('/inventory')) {
    return 'Unexpected redirect to inventory';
  }

  try {
    const errorEl = await driver.wait(until.elementLocated(By.css('[data-test="error"]')), wait);
    return (await errorEl.getText()).trim();
  } catch {
    try {
      const container = await driver.findElement(By.css('#login_button_container'));
      return (await container.getText()).trim();
    } catch {
      return '';
    }
  }
}

export async function resetAppState(driver: WebDriver, wait = WAIT) {
  try {
    const menuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
    await driver.executeScript('arguments[0].click();', menuBtn);
    const resetLink = await driver.wait(until.elementLocated(By.id('reset_sidebar_link')), wait);
    await driver.executeScript('arguments[0].click();', resetLink);
    await driver.wait(async () => {
      const badges = await driver.findElements(By.css('.shopping_cart_badge'));
      return badges.length === 0;
    }, wait);
  } catch {
    // ignore if reset is not available or already in a clean state
  }
}
