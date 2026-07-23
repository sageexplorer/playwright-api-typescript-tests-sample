import { test, expect } from '@playwright/test';

// REST API checks against the site's published API (https://automationexercise.com/api_list).
// Quirk asserted deliberately throughout: the transport status is always HTTP 200;
// the real outcome is the `responseCode` field in the JSON body.

test.describe('Automation Exercise REST API', () => {
  test('GET /api/productsList returns a well-formed product catalogue', async ({ request }) => {
    const response = await request.get('/api/productsList');

    expect(response.status()).toBe(200);

    // Known defect, not asserted: the body is JSON but the server mislabels
    // Content-Type as "text/html" on GET (HEAD says "application/json").
    // response.json() parses it regardless; a real suite would file this.
    const body = await response.json();
    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(0);

    for (const product of body.products) {
      expect(product).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.stringMatching(/^Rs\. \d+$/),
        brand: expect.any(String),
        category: {
          usertype: { usertype: expect.any(String) },
          category: expect.any(String),
        },
      });
    }
  });

  test('POST /api/verifyLogin rejects unknown credentials', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: { email: 'no.such.user.qa@example.com', password: 'not-a-real-password' },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      responseCode: 404,
      message: 'User not found!',
    });
  });

  test('POST /api/verifyLogin without a password is a bad request', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: { email: 'no.such.user.qa@example.com' },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({
      responseCode: 400,
      message: 'Bad request, email or password parameter is missing in POST request.',
    });
  });
});
