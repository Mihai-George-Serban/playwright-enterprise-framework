/// <reference types="cypress" />

// Cypress support file - shared commands and utilities

// Custom command for login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/');
  cy.get('#user-name').type(username);
  cy.get('#password').type(password);
  cy.get('[data-test="login-button"]').click();
  cy.url().should('include', '/inventory.html');
});

declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable;
  }
}

export {};