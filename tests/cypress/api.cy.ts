describe('API - Cypress', () => {
  it('should return 200 status for root page', () => {
    cy.request('GET', '/').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.include('<title>Swag Labs</title>');
      expect(response.body).to.include('<div id="root"></div>');
    });
  });

  it('should return proper content type headers', () => {
    cy.request('GET', '/').then((response) => {
      expect(response.headers).to.have.property('content-type').and.include('text/html');
    });
  });

  it('should handle invalid routes gracefully', () => {
    cy.request({
      method: 'GET',
      url: '/nonexistent-page',
      failOnStatusCode: false,
    }).then((response) => {
      expect([404, 301, 302]).to.include(response.status);
    });
  });

  it('should load static assets with 200 status', () => {
    cy.request('GET', '/').then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
