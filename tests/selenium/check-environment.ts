import { existsSync } from 'fs';
import { resolve } from 'path';

function safeRequire(moduleName: string) {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
}

function checkPackage(packageName: string) {
  const pkg = safeRequire(`${packageName}/package.json`);
  return pkg ? true : false;
}

function printResult(name: string, ok: boolean, message: string) {
  const status = ok ? 'OK' : 'MISSING';
  console.log(`${status} - ${name}: ${message}`);
}

const root = resolve(__dirname, '../../');
const cypressConfig = resolve(root, 'cypress.config.ts');
const seleniumModule = checkPackage('selenium-webdriver');
const tsNodeModule = checkPackage('ts-node');
const chromeDriverModule = checkPackage('chromedriver');
const geckoDriverModule = checkPackage('geckodriver');

console.log('Selenium environment check:');
printResult('selenium-webdriver', seleniumModule, seleniumModule ? 'Installed' : 'Not installed');
printResult('ts-node', tsNodeModule, tsNodeModule ? 'Installed' : 'Not installed');
printResult('cypress.config.ts', existsSync(cypressConfig), existsSync(cypressConfig) ? 'Configuration file found' : 'Configuration file missing');
printResult('chromedriver', chromeDriverModule, chromeDriverModule ? 'Installed' : 'Optional for Chrome automation');
printResult('geckodriver', geckoDriverModule, geckoDriverModule ? 'Installed' : 'Optional for Firefox automation');

if (!seleniumModule || !tsNodeModule) {
  console.log('\nSteps to fix:');
  if (!seleniumModule) {
    console.log('  npm install --save-dev selenium-webdriver');
  }
  if (!tsNodeModule) {
    console.log('  npm install --save-dev ts-node');
  }
}

if (!chromeDriverModule && !geckoDriverModule) {
  console.log('\nNote: If you want to run Selenium against local browsers, install one of:');
  console.log('  npm install --save-dev chromedriver');
  console.log('  npm install --save-dev geckodriver');
}

process.exit(!seleniumModule || !tsNodeModule ? 1 : 0);
