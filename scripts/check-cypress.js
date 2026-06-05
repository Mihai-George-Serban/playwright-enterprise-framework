const { existsSync } = require('fs');
const { resolve } = require('path');

function safeRequire(moduleName) {
  try {
    return require(moduleName);
  } catch {
    return null;
  }
}

const root = resolve(__dirname, '..');
const cypressConfig = resolve(root, 'cypress.config.ts');
const cypressPackage = safeRequire('cypress/package.json');

console.log('Cypress environment check:');
if (cypressPackage) {
  console.log(`OK - cypress: installed (${cypressPackage.version})`);
} else {
  console.log('MISSING - cypress: not installed');
}
console.log(`${existsSync(cypressConfig) ? 'OK' : 'MISSING'} - cypress.config.ts: ${existsSync(cypressConfig) ? 'Configuration file found' : 'Configuration file missing'}`);

if (!cypressPackage) {
  console.log('\nRun: npm install --save-dev cypress');
  process.exit(1);
}

process.exit(0);
