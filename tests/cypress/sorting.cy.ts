describe('Sorting - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('standard_user', 'secret_sauce');
  });

  it('should sort products from high to low price', () => {
    cy.get('.product_sort_container').select('hilo');
    cy.get('.inventory_item_price').first().should('contain', '$49.99');
  });

  it('should sort products from A to Z', () => {
    cy.get('.product_sort_container').select('az');
    cy.get('.inventory_item_name').first().should('contain', 'Sauce Labs Backpack');
  });

  it('should sort products from Z to A', () => {
    cy.get('.product_sort_container').select('za');
    cy.get('.inventory_item_name').first().should('contain', 'Test.allTheThings() T-Shirt (Red)');
  });

  it('should reset sort selection to default after the page is reloaded', () => {
    cy.get('.product_sort_container').select('lohi');
    cy.reload();
    cy.get('.product_sort_container').should('have.value', 'az');
  });

  it('should show the expected first price after sorting low to high', () => {
    cy.get('.product_sort_container').select('lohi');
    cy.get('.inventory_item_price').first().should('contain', '$7.99');
  });
});
