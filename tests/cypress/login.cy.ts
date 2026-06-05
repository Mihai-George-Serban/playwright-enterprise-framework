describe('Login - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    
    cy.url().should('include', '/inventory.html');
    cy.get('.title').should('contain', 'Products');
  });

  it('should show error with invalid credentials', () => {
    cy.get('#user-name').type('invalid_user');
    cy.get('#password').type('wrong_password');
    cy.get('[data-test="login-button"]').click();
    
    cy.get('[data-test="error"]').should('be.visible');
    cy.get('[data-test="error"]').should('contain', 'Username and password');
  });

  it('should navigate to products page after login', () => {
    cy.login('standard_user', 'secret_sauce');
    // ensure an add-to-cart button is present using the known data-test attribute
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('exist');
  });

  it('should show error with empty username', () => {
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Username is required');
  });

  it('should show error with empty password', () => {
    cy.get('#user-name').type('standard_user');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'Password is required');
  });

  it('should prevent a locked out user from logging in', () => {
    cy.get('#user-name').type('locked_out_user');
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.get('[data-test="error"]').should('be.visible').and('contain', 'locked out');
  });

  it('should allow a problem user to load inventory items', () => {
    cy.get('#user-name').type('problem_user');
    cy.get('#password').type('secret_sauce');
    cy.get('[data-test="login-button"]').click();
    cy.url().should('include', '/inventory.html');
    cy.get('.inventory_item').should('have.length', 6);
  });
});
