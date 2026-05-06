describe('Civilian portal flows', () => {
  const token = 'test-access-token';
  const user = { id: 'user-1', fullName: 'Test User', role: 'civilian', email: 't@example.com' };

  beforeEach(() => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { accessToken: token, user },
    }).as('login');

    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: { id: 'new', email: 'n@example.com', role: 'civilian' },
    }).as('register');

    cy.intercept('GET', '**/api/incident/incidents?owner=me', {
      statusCode: 200,
      body: [
        {
          id: 'inc-1',
          incidentType: 'Theft',
          description: 'Test',
          locationLat: -33.9,
          locationLng: 18.4,
          status: 'investigating',
          assignedOfficerId: null,
        },
      ],
    }).as('reports');

    cy.intercept('GET', '**/api/incident/incidents/inc-1/status', {
      statusCode: 200,
      body: { id: 'inc-1', status: 'investigating', assignedOfficerId: null },
    }).as('status');

    cy.intercept('GET', '**/api/map/map/layers?role=civilian', {
      statusCode: 200,
      body: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 'h1', name: 'Hotspot', severity: 'high', category: 'crime_hotspot' },
            geometry: { type: 'Point', coordinates: [18.4, -33.9] },
          },
        ],
      },
    }).as('layers');

    cy.intercept('POST', '**/api/incident/incidents', {
      statusCode: 201,
      body: { id: 'new-inc', status: 'pending' },
    }).as('createIncident');

    cy.intercept('POST', '**/api/alerts/sos', { statusCode: 202, body: { id: 'sos-1' } }).as('sos');
  });

  it('signs in and reaches civilian dashboard', () => {
    cy.visit('/');
    cy.get('input[type=email]').type('t@example.com');
    cy.get('input[type=password]').type('P@ssw0rd!');
    cy.contains('button', 'Sign in').click();
    cy.wait('@login');
    cy.url().should('include', '/civilian/dashboard');
  });

  it('submits incident wizard (mocked API)', () => {
    cy.visit('/');
    cy.get('input[type=email]').type('t@example.com');
    cy.get('input[type=password]').type('P@ssw0rd!');
    cy.contains('button', 'Sign in').click();
    cy.wait('@login');

    cy.visit('/civilian/report');
    cy.contains('Theft / Robbery').click();
    cy.contains('Continue to Urgency').click();
    cy.contains('High Priority').click();
    cy.contains('Next: Describe').click();
    cy.get('textarea').first().type('Stolen bag.');
    cy.contains('Next: Location').click();
    cy.contains('Next: Upload Media').click();
    cy.contains('Next: Review').click();
    cy.contains('Submit Report').click();
    cy.wait('@createIncident');
    cy.url().should('include', '/civilian/my-reports');
  });

  it('loads my reports list', () => {
    cy.visit('/');
    cy.get('input[type=email]').type('t@example.com');
    cy.get('input[type=password]').type('P@ssw0rd!');
    cy.contains('button', 'Sign in').click();
    cy.wait('@login');
    cy.visit('/civilian/my-reports');
    cy.wait('@reports');
    cy.contains('Theft');
  });

  it('requests map layers', () => {
    cy.visit('/');
    cy.get('input[type=email]').type('t@example.com');
    cy.get('input[type=password]').type('P@ssw0rd!');
    cy.contains('button', 'Sign in').click();
    cy.wait('@login');
    cy.visit('/civilian/map');
    cy.wait('@layers');
  });

  it('sends SOS (mocked)', () => {
    cy.visit('/');
    cy.get('input[type=email]').type('t@example.com');
    cy.get('input[type=password]').type('P@ssw0rd!');
    cy.contains('button', 'Sign in').click();
    cy.wait('@login');
    cy.visit('/civilian/alerts', {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
          cb({ coords: { latitude: -33.9, longitude: 18.4 } });
        });
      },
    });
    cy.contains('Send SOS').click();
    cy.wait('@sos');
  });
});
