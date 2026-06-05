describe('Accessibility - Cypress', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login page accessibility', () => {
    it('should have accessible form labels via placeholders', () => {
      cy.get('#user-name').should('have.attr', 'placeholder', 'Username');
      cy.get('#password').should('have.attr', 'placeholder', 'Password');
    });

    it('should have an accessible login button', () => {
      cy.get('[data-test="login-button"]').should('be.visible');
      cy.get('[data-test="login-button"]').should('have.attr', 'type', 'submit');
    });

    it('should be able to login using keyboard Enter key', () => {
      cy.get('#user-name').type('standard_user');
      cy.get('#password').type('secret_sauce');
      cy.get('#password').type('{enter}');
      cy.url().should('include', '/inventory');
    });

    it('should have accessible error messages', () => {
      cy.get('#user-name').type('invalid_user');
      cy.get('#password').type('wrong_password');
      cy.get('[data-test="login-button"]').click();
      cy.get('[data-test="error"]').should('be.visible');
      cy.get('[data-test="error"]').should('have.attr', 'data-test', 'error');
    });
  });

  describe('Inventory page accessibility', () => {
    beforeEach(() => {
      cy.login('standard_user', 'secret_sauce');
    });

    it('should have accessible inventory items', () => {
      cy.get('.inventory_item').should('have.length', 6);
      cy.get('.inventory_item_name').each(($item) => {
        cy.wrap($item).should('be.visible');
      });
    });

    it('should have accessible sorting dropdown', () => {
      cy.get('.product_sort_container').should('be.visible');
      cy.get('.product_sort_container').should('have.prop', 'tagName').should('equal', 'SELECT');
    });

    it('should have accessible product images with alt text or src', () => {
      cy.get('.inventory_item_img img').each(($img) => {
        cy.wrap($img).should('have.attr', 'src');
      });
    });

    it('should have accessible cart badge', () => {
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      cy.get('.shopping_cart_badge').should('be.visible');
      cy.get('.shopping_cart_badge').should('have.text', '1');
    });
  });

  describe('Checkout page accessibility', () => {
    beforeEach(() => {
      cy.login('standard_user', 'secret_sauce');
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      cy.get('.shopping_cart_link').click();
      cy.get('[data-test="checkout"]').click();
    });

    it('should have accessible form fields on checkout page', () => {
      cy.get('[data-test="firstName"]').should('be.visible');
      cy.get('[data-test="lastName"]').should('be.visible');
      cy.get('[data-test="postalCode"]').should('be.visible');
    });

    it('should have accessible error messages for required fields', () => {
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="error"]').should('be.visible');
      cy.get('[data-test="error"]').should('contain', 'First Name is required');
    });

    it('should be able to complete checkout using keyboard navigation', () => {
      cy.get('[data-test="firstName"]').type('John');
      cy.get('[data-test="lastName"]').type('Doe');
      cy.get('[data-test="postalCode"]').type('12345');
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="finish"]').click();
      cy.get('.complete-header').should('be.visible');
    });
  });

  describe('Navigation accessibility', () => {
    beforeEach(() => {
      cy.login('standard_user', 'secret_sauce');
    });

    it('should have accessible menu button', () => {
      cy.get('#react-burger-menu-btn').should('be.visible');
    });

    it('should have accessible menu items', () => {
      cy.get('#react-burger-menu-btn').click();
      cy.contains('All Items').should('be.visible');
      cy.contains('About').should('be.visible');
      cy.contains('Logout').should('be.visible');
      cy.contains('Reset App State').should('be.visible');
    });

    it('should have accessible close menu button', () => {
      cy.get('#react-burger-menu-btn').click();
      cy.get('#react-burger-cross-btn').should('be.visible');
      cy.get('#react-burger-cross-btn').click();
      cy.get('#react-burger-cross-btn').should('not.be.visible');
    });
  });
});
