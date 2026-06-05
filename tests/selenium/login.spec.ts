import { WebDriver, By, until } from 'selenium-webdriver';

const WAIT = 10000;

async function getLoginErrorText(driver: WebDriver) {
  try {
    const errorEl = await driver.wait(until.elementLocated(By.css('[data-test="error"]')), WAIT);
    return await errorEl.getText();
  } catch {
    const container = await driver.findElement(By.css('#login_button_container'));
    return await container.getText();
  }
}

export async function loginTests(driver: WebDriver, baseUrl: string) {
  const testResults: { name: string; passed: boolean; error?: string }[] = [];

  // Test 1: Successful login
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
    await driver.findElement(By.id('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    await driver.findElement(By.id('login-button')).click();
    await driver.wait(until.urlContains('/inventory'), WAIT);
    testResults.push({ name: 'Login - Successful login', passed: true });
  } catch (e) {
    testResults.push({ name: 'Login - Successful login', passed: false, error: String(e) });
  }

  // Test 2: Login with invalid username
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
    await driver.findElement(By.id('user-name')).clear();
    await driver.findElement(By.id('user-name')).sendKeys('invalid_user');
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    await driver.findElement(By.id('login-button')).click();
    const errorMsg = await getLoginErrorText(driver);
    if (errorMsg.includes('Username and password do not match')) {
      testResults.push({ name: 'Login - Invalid username error', passed: true });
    } else {
      testResults.push({ name: 'Login - Invalid username error', passed: false, error: `Unexpected error message: ${errorMsg}` });
    }
  } catch (e) {
    testResults.push({ name: 'Login - Invalid username error', passed: false, error: String(e) });
  }

  // Test 3: Login with invalid password
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
    await driver.findElement(By.id('user-name')).clear();
    await driver.findElement(By.id('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('password')).sendKeys('wrong_password');
    await driver.findElement(By.id('login-button')).click();
    const errorMsg = await getLoginErrorText(driver);
    if (errorMsg.includes('Username and password do not match')) {
      testResults.push({ name: 'Login - Invalid password error', passed: true });
    } else {
      testResults.push({ name: 'Login - Invalid password error', passed: false, error: `Unexpected error message: ${errorMsg}` });
    }
  } catch (e) {
    testResults.push({ name: 'Login - Invalid password error', passed: false, error: String(e) });
  }

  // Test 4: Login with empty username
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.id('password')), WAIT);
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('password')).sendKeys('secret_sauce');
    await driver.findElement(By.id('login-button')).click();
    const errorMsg = await getLoginErrorText(driver);
    if (errorMsg.includes('Username is required')) {
      testResults.push({ name: 'Login - Empty username error', passed: true });
    } else {
      testResults.push({ name: 'Login - Empty username error', passed: false, error: `Unexpected error message: ${errorMsg}` });
    }
  } catch (e) {
    testResults.push({ name: 'Login - Empty username error', passed: false, error: String(e) });
  }

  // Test 5: Login with empty password
  try {
    await driver.get(baseUrl + '/');
    await driver.wait(until.elementLocated(By.id('user-name')), WAIT);
    await driver.findElement(By.id('user-name')).clear();
    await driver.findElement(By.id('user-name')).sendKeys('standard_user');
    await driver.findElement(By.id('password')).clear();
    await driver.findElement(By.id('login-button')).click();
    const errorMsg = await getLoginErrorText(driver);
    if (errorMsg.includes('Password is required')) {
      testResults.push({ name: 'Login - Empty password error', passed: true });
    } else {
      testResults.push({ name: 'Login - Empty password error', passed: false, error: `Unexpected error message: ${errorMsg}` });
    }
  } catch (e) {
    testResults.push({ name: 'Login - Empty password error', passed: false, error: String(e) });
  }

  return testResults;
}
