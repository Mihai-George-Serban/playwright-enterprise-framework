describe('Products - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('standard_user', 'secret_sauce');
  });

  it('should display all product names', () => {
    cy.get('.inventory_item_name').should('have.length', 6);
    cy.get('.inventory_item_name').first().should('contain', 'Sauce Labs Backpack');
    cy.get('.inventory_item_name').last().should('contain', 'Test.allTheThings() T-Shirt (Red)');
  });

  it('should show product prices for every item', () => {
    cy.get('.inventory_item_price').should('have.length', 6);
    cy.get('.inventory_item_price').each(($price) => {
      cy.wrap($price).invoke('text').should('match', /\$\d+\.\d{2}/);
    });
  });

  it('should display a product image for each item', () => {
    cy.get('.inventory_item_img').should('have.length.at.least', 6);
    cy.get('.inventory_item_img img').each(($img) => {
      cy.wrap($img).should('be.visible');
      cy.wrap($img).invoke('attr', 'src').should('match', /\.(jpg|png|gif)$/);
    });
  });

  it('should add every item to the cart successfully', () => {
    cy.get('[data-test^="add-to-cart"]').each(($button) => {
      cy.wrap($button).click();
    });
    cy.get('.shopping_cart_badge').should('contain', '6');
  });

  it('should navigate to a product detail page', () => {
    cy.get('[data-test="item-4-title-link"]').click();
    cy.url().should('include', '/inventory-item.html');
    cy.get('.inventory_details_name').should('exist');
    cy.get('.inventory_details_price').should('contain', '$');
  });

  it('should be able to return to inventory from product details', () => {
    cy.get('[data-test="item-4-title-link"]').click();
    cy.get('[data-test="back-to-products"]').click();
    cy.url().should('include', '/inventory.html');
    cy.get('.inventory_list').should('be.visible');
  });
});
