describe('Menu - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('standard_user', 'secret_sauce');
  });

  it('should show all sidebar menu items', () => {
    cy.get('#react-burger-menu-btn').click();
    cy.get('.bm-item-list').should('contain', 'All Items');
    cy.get('.bm-item-list').should('contain', 'About');
    cy.get('.bm-item-list').should('contain', 'Logout');
    cy.get('.bm-item-list').should('contain', 'Reset App State');
  });

  it('should close the sidebar menu when the close button is clicked', () => {
    cy.get('#react-burger-menu-btn').click();
    cy.get('#react-burger-cross-btn').click();
    cy.get('#react-burger-cross-btn').should('not.be.visible');
    cy.get('.bm-menu-wrap').should('have.css', 'transform').and((value) => {
      expect(value).to.not.equal('matrix(1, 0, 0, 1, 0, 0)');
    });
  });

  it('should reset app state and remove cart items', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    cy.get('#react-burger-menu-btn').click();
    cy.contains('Reset App State').click();
    cy.get('.shopping_cart_badge').should('not.exist');
  });

  it('should be able to logout from the menu', () => {
    cy.get('#react-burger-menu-btn').click();
    cy.contains('Logout').click();
    cy.url().should('eq', 'https://www.saucedemo.com/');
    cy.get('#login-button').should('exist');
  });

  it('should expose the About link with a Sauce Labs destination', () => {
    cy.get('#react-burger-menu-btn').click();
    cy.contains('About').should('have.attr', 'href').and('include', 'saucelabs.com');
  });
});
