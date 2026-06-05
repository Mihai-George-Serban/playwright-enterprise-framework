describe('Mobile Checkout - Cypress', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.login('standard_user', 'secret_sauce');
  });

  it('should display inventory on mobile viewport', () => {
    cy.get('.inventory_list').should('be.visible');
    cy.get('.inventory_item').should('have.length', 6);
  });

  it('should add items to cart on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_badge').should('have.text', '1');
  });

  it('should navigate to cart on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.url().should('include', '/cart');
    cy.get('.cart_list').should('be.visible');
  });

  it('should proceed through checkout on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type('John');
    cy.get('[data-test="lastName"]').type('Doe');
    cy.get('[data-test="postalCode"]').type('12345');
    cy.get('[data-test="continue"]').click();
    cy.url().should('include', '/checkout-step-two');
  });

  it('should complete order on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="checkout"]').click();
    cy.get('[data-test="firstName"]').type('John');
    cy.get('[data-test="lastName"]').type('Doe');
    cy.get('[data-test="postalCode"]').type('12345');
    cy.get('[data-test="continue"]').click();
    cy.get('[data-test="finish"]').click();
    cy.get('.complete-header').should('contain', 'Thank you for your order');
  });

  it('should allow continuing shopping on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="continue-shopping"]').click();
    cy.url().should('include', '/inventory');
  });

  it('should allow removing items from cart on mobile', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.get('[data-test="remove-sauce-labs-backpack"]').click();
    cy.get('.cart_item').should('have.length', 0);
  });

  it('should display mobile hamburger menu', () => {
    cy.get('#react-burger-menu-btn').should('be.visible');
  });

  it('should handle mobile menu operations', () => {
    cy.get('#react-burger-menu-btn').click();
    cy.contains('Logout').should('be.visible');
  });
});
