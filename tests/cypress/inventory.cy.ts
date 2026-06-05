describe('Inventory - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('standard_user', 'secret_sauce');
  });

  it('should display inventory items', () => {
    cy.get('.inventory_item').should('have.length', 6);
  });

  it('should add item to cart', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('[data-test="remove-sauce-labs-backpack"]').should('exist');
    cy.get('.shopping_cart_badge').should('contain', '1');
  });

  it('should navigate to cart', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('.shopping_cart_link').click();
    cy.url().should('include', '/cart.html');
    cy.get('.cart_item').should('have.length', 1);
  });

  it('should sort items by price', () => {
    // use the product_sort_container class (matches Playwright tests)
    cy.get('.product_sort_container').select('lohi');
    cy.get('.inventory_item_price').first().should('contain', '$7.99');
  });
});
