describe('Mobile Login - Cypress', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
  });

  it('should display login form on mobile viewport', () => {
    cy.get('.login-box').should('be.visible');
    cy.get('#user-name').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.get('[data-test="login-button"]').should('be.visible');
  });

  it('should successfully login on mobile viewport', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory');
    cy.get('.inventory_list').should('be.visible');
  });

  it('should show error on invalid credentials on mobile', () => {
    cy.get('#user-name').type('invalid_user');
    cy.get('#password').type('wrong_password');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible');
  });

  it('should handle empty username on mobile', () => {
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Username is required');
  });

  it('should handle empty password on mobile', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Password is required');
  });

  it('should be able to clear fields on mobile', () => {
    cy.get('#user-name').type('test').clear();
    cy.get('#user-name').should('have.value', '');
  });
});
