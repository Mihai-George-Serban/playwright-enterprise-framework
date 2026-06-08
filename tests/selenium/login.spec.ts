import { WebDriver, By, until } from 'selenium-webdriver';
import {
  WAIT,
  setInputValue,
  getLoginErrorText,
  submitLogin,
  prepareLoginPage,
} from './helpers';

type LoginTestResult = { name: string; passed: boolean; error?: string };

export const LOGIN_TEST_CASES: { name: string; run: (driver: WebDriver, baseUrl: string) => Promise<LoginTestResult> }[] = [
  {
    name: 'Login - Invalid username error',
    run: async (driver, baseUrl) => {
      try {
        await prepareLoginPage(driver, baseUrl);
        const userEl = await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
        const passEl = await driver.findElement(By.id('password'));
        await setInputValue(driver, userEl, 'invalid_user');
        await setInputValue(driver, passEl, 'secret_sauce', { password: true });
        await submitLogin(driver);
        const errorMsg = await getLoginErrorText(driver);
        if (errorMsg.includes('Username and password do not match')) {
          return { name: 'Login - Invalid username error', passed: true };
        }
        return { name: 'Login - Invalid username error', passed: false, error: `Unexpected error message: ${errorMsg}` };
      } catch (e) {
        return { name: 'Login - Invalid username error', passed: false, error: String(e) };
      }
    },
  },
  {
    name: 'Login - Invalid password error',
    run: async (driver, baseUrl) => {
      try {
        await prepareLoginPage(driver, baseUrl);
        const userEl = await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
        const passEl = await driver.findElement(By.id('password'));
        await setInputValue(driver, passEl, 'wrong_password', { password: true });
        await setInputValue(driver, userEl, 'standard_user');
        await submitLogin(driver);
        const errorMsg = await getLoginErrorText(driver);
        if (errorMsg.includes('Username and password do not match')) {
          return { name: 'Login - Invalid password error', passed: true };
        }
        return { name: 'Login - Invalid password error', passed: false, error: `Unexpected error message: ${errorMsg}` };
      } catch (e) {
        return { name: 'Login - Invalid password error', passed: false, error: String(e) };
      }
    },
  },
  {
    name: 'Login - Empty username error',
    run: async (driver, baseUrl) => {
      try {
        await prepareLoginPage(driver, baseUrl);
        await driver.wait(until.elementLocated(By.id('password')), WAIT);
        await setInputValue(
          driver,
          await driver.findElement(By.id('password')),
          'secret_sauce',
          { password: true }
        );
        await submitLogin(driver);
        const errorMsg = await getLoginErrorText(driver);
        if (errorMsg.includes('Username is required')) {
          return { name: 'Login - Empty username error', passed: true };
        }
        return { name: 'Login - Empty username error', passed: false, error: `Unexpected error message: ${errorMsg}` };
      } catch (e) {
        return { name: 'Login - Empty username error', passed: false, error: String(e) };
      }
    },
  },
  {
    name: 'Login - Empty password error',
    run: async (driver, baseUrl) => {
      try {
        await prepareLoginPage(driver, baseUrl);
        await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
        await setInputValue(driver, await driver.findElement(By.id('user-name')), 'standard_user');
        await submitLogin(driver);
        const errorMsg = await getLoginErrorText(driver);
        if (errorMsg.includes('Password is required')) {
          return { name: 'Login - Empty password error', passed: true };
        }
        return { name: 'Login - Empty password error', passed: false, error: `Unexpected error message: ${errorMsg}` };
      } catch (e) {
        return { name: 'Login - Empty password error', passed: false, error: String(e) };
      }
    },
  },
  {
    name: 'Login - Successful login',
    run: async (driver, baseUrl) => {
      try {
        await prepareLoginPage(driver, baseUrl);
        const userEl = await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
        const passEl = await driver.findElement(By.id('password'));
        await setInputValue(driver, userEl, 'standard_user');
        await setInputValue(driver, passEl, 'secret_sauce', { password: true });
        await submitLogin(driver);
        await driver.wait(until.urlContains('/inventory'), WAIT);
        return { name: 'Login - Successful login', passed: true };
      } catch (e) {
        return { name: 'Login - Successful login', passed: false, error: String(e) };
      }
    },
  },
];

export async function loginTests(driver: WebDriver, baseUrl: string) {
  const testResults: LoginTestResult[] = [];
  for (const testCase of LOGIN_TEST_CASES) {
    testResults.push(await testCase.run(driver, baseUrl));
  }
  return testResults;
}
