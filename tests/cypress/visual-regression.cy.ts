describe('Visual Regression - Cypress', () => {
  beforeEach(() => {
    // Set consistent viewport for visual regression tests
    cy.viewport(1280, 720);
  });

  describe('Login page visual consistency', () => {
    it('should have consistent login page layout', () => {
      cy.visit('/');
      cy.get('.login-box').should('be.visible');
      cy.get('#user-name').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('[data-test="login-button"]').should('be.visible');
    });

    it('should have correct button styling', () => {
      cy.visit('/');
      cy.get('[data-test="login-button"]')
        .should('have.css', 'background-color')
        .and('match', /rgb|rgba/);
    });
  });

  describe('Inventory page visual consistency', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.login('standard_user', 'secret_sauce');
    });

    it('should display inventory list with consistent layout', () => {
      cy.get('.inventory_list').should('be.visible');
      cy.get('.inventory_item').should('have.length', 6);
    });

    it('should have consistent product item structure', () => {
      cy.get('.inventory_item').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('.inventory_item_img').should('be.visible');
          cy.get('.inventory_item_name').should('be.visible');
          cy.get('.inventory_item_price').should('be.visible');
          cy.get('[data-test^="add-to-cart"]').should('be.visible');
        });
      });
    });

    it('should have consistent header styling', () => {
      cy.get('.app_logo').should('be.visible');
      cy.get('.shopping_cart_container').should('be.visible');
    });

    it('should have consistent sorting dropdown styling', () => {
      cy.get('.product_sort_container').should('be.visible');
      cy.get('.product_sort_container').should('have.css', 'display');
    });
  });

  describe('Cart page visual consistency', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.login('standard_user', 'secret_sauce');
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      cy.get('.shopping_cart_link').click();
    });

    it('should display cart items with consistent layout', () => {
      cy.get('.cart_list').should('be.visible');
      cy.get('.cart_item').should('have.length', 1);
    });

    it('should have consistent cart item structure', () => {
      cy.get('.cart_item').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('.inventory_item_name').should('be.visible');
          cy.get('.inventory_item_price').should('be.visible');
        });
      });
    });

    it('should have visible checkout button', () => {
      cy.get('[data-test="checkout"]').should('be.visible');
    });
  });

  describe('Checkout page visual consistency', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.login('standard_user', 'secret_sauce');
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      cy.get('.shopping_cart_link').click();
      cy.get('[data-test="checkout"]').click();
    });

    it('should display checkout form with all fields visible', () => {
      cy.get('[data-test="firstName"]').should('be.visible');
      cy.get('[data-test="lastName"]').should('be.visible');
      cy.get('[data-test="postalCode"]').should('be.visible');
      cy.get('[data-test="continue"]').should('be.visible');
    });

    it('should have consistent form field styling', () => {
      cy.get('[data-test="firstName"]').should('have.css', 'display');
      cy.get('[data-test="lastName"]').should('have.css', 'display');
      cy.get('[data-test="postalCode"]').should('have.css', 'display');
    });
  });

  describe('Order completion page visual consistency', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.login('standard_user', 'secret_sauce');
      cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
      cy.get('.shopping_cart_link').click();
      cy.get('[data-test="checkout"]').click();
      cy.get('[data-test="firstName"]').type('John');
      cy.get('[data-test="lastName"]').type('Doe');
      cy.get('[data-test="postalCode"]').type('12345');
      cy.get('[data-test="continue"]').click();
      cy.get('[data-test="finish"]').click();
    });

    it('should display success message with consistent styling', () => {
      cy.get('.complete-header').should('be.visible');
      cy.get('.complete-header').should('contain', 'Thank you for your order');
    });

    it('should have visible back home button', () => {
      cy.get('[data-test="back-to-products"]').should('be.visible');
    });
  });
});
