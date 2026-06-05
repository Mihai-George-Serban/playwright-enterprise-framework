# playwright-enterprise-framework
Enterprise-level test automation framework supporting Playwright, Cypress, and Selenium with TypeScript.

## Overview
This framework provides comprehensive E2E testing capabilities across three major automation tools:
- **Playwright** - Fast, modern browser automation
- **Cypress** - Developer-friendly E2E testing
- **Selenium** - Industry-standard cross-browser testing

## Project Structure
```
tests/
├── playwright/         # Playwright test suites
│   ├── ui/            # UI tests
│   ├── mobile/        # Mobile-specific tests
│   ├── api/           # API tests
│   ├── accessibility/ # Accessibility tests
│   └── visual/        # Visual regression tests
├── cypress/           # Cypress test suites
│   ├── support/       # Custom commands and utilities
│   └── *.cy.ts       # Cypress test files
└── selenium/          # Selenium test suites
    └── runner.ts      # Selenium test runner
```

## Installation
```bash
npm install
```

## Running Tests

### Run All Test Suites
```bash
npm test
```

### Run Individual Frameworks
```bash
# Playwright
npm run test:playwright

# Cypress
npm run test:cypress

# Selenium
npm run test:selenium
```

### Cypress helper scripts
```bash
npm run cypress:run
npm run cypress:open
npm run cypress:headed
npm run cypress:chrome
npm run cypress:firefox
npm run cypress:login
npm run cypress:inventory
npm run cypress:record
npm run cypress:smoke
npm run cypress:verify
```

### Selenium helper scripts
```bash
npm run selenium:run
npm run selenium:run:all
npm run selenium:run:login
npm run selenium:run:inventory
npm run selenium:run:add-to-cart
npm run selenium:run:cart
npm run selenium:run:chrome
npm run selenium:run:firefox
npm run selenium:run:headless
npm run selenium:run:smoke
npm run selenium:check
```

### Environment checks
```bash
npm run check:cypress
npm run check:selenium
```

### Visual regression snapshots
When adding or updating baselines for Playwright visual tests, run:
```bash
npm run test:playwright -- --update-snapshots
```

## Configuration Files
- `playwright.config.ts` - Playwright configuration
- `cypress.config.ts` - Cypress configuration
- `tests/selenium/runner.ts` - Selenium test runner

## CI/CD
Tests run automatically on push and pull requests to `main` and `master` branches via GitHub Actions.
Test reports and artifacts are retained for 30 days.
