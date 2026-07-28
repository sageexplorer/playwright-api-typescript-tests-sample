import { test, expect, APIResponse } from '@playwright/test';

// REST API test sample — three tests against the published API of
// https://automationexercise.com (endpoint list: /api_list).
//
// API-only on purpose: no browser, no UI — pure HTTP through Playwright's
// APIRequestContext. Tests at this layer run in ~2 s, so they make a fast
// smoke layer in CI ahead of the slower UI end-to-end suite, while sharing
// the same runner, reporting, and tooling.
//
//   1. Account lifecycle — one user driven through create → authenticate →
//      read → update → delete, every state change verified by reading it back.
//   2. Catalogue contract — every product record must match the expected schema.
//   3. Negative cases — malformed requests must fail with the documented errors.
//
// Self-contained file — no config or helper files needed.
// Run: npm i -D @playwright/test && npx playwright test api-tests.spec.ts
//
// Contract quirk asserted deliberately throughout: this API's transport status
// is always HTTP 200; the real outcome is the `responseCode` field inside the
// JSON body. Pinning both down keeps the tests honest about what the API
// actually promises.

const BASE = 'https://automationexercise.com/api';

const USER = {
  email: `sage.qa.api.${Date.now()}@example.com`, // timestamped: repeated or parallel runs never collide
  password: 'Str0ng!Passw0rd',
};

// POST /createAccount is form-encoded and takes birth_date / firstname / lastname…
const PROFILE: Record<string, string> = {
  name: 'Sage QA',
  ...USER,
  title: 'Mrs',
  birth_date: '14',
  birth_month: '7',
  birth_year: '1996',
  firstname: 'Sage',
  lastname: 'QA',
  company: 'QA Co',
  address1: '123 Test Street',
  address2: 'Suite 5',
  country: 'United States',
  state: 'California',
  city: 'Los Angeles',
  zipcode: '90001',
  mobile_number: '3105550142',
};

// …while GET /getUserDetailByEmail echoes the same data back under different
// names (birth_day / first_name / last_name). Asserting the mapping explicitly
// catches silent field-mapping regressions.
const PROFILE_ECHO = {
  name: PROFILE.name,
  email: PROFILE.email,
  title: PROFILE.title,
  birth_day: PROFILE.birth_date,
  birth_month: PROFILE.birth_month,
  birth_year: PROFILE.birth_year,
  first_name: PROFILE.firstname,
  last_name: PROFILE.lastname,
  company: PROFILE.company,
  address1: PROFILE.address1,
  address2: PROFILE.address2,
  country: PROFILE.country,
  state: PROFILE.state,
  city: PROFILE.city,
  zipcode: PROFILE.zipcode,
};

// Assert the always-200 transport once, here; every test below then reads as
// pure business-level contract: what must the body say?
const body = async (call: Promise<APIResponse>) => {
  const response = await call;
  expect(response.status()).toBe(200);
  return response.json();
};

test.describe('Automation Exercise REST API', () => {
  // One account driven through its entire life. The pattern to note: no step
  // trusts the response of a write — creation is proven by a successful login,
  // the update by re-reading the profile, and deletion by the login failing
  // afterwards. A write that returns "success" but doesn't persist fails here.
  test('account lifecycle: create → authenticate → read → update → delete', async ({ request }) => {
    test.setTimeout(60_000); // 8 sequential round-trips against a slow shared host

    // Always re-fetched, never cached — assertions run against real server state.
    const getUser = async () =>
      (await body(request.get(`${BASE}/getUserDetailByEmail`, { params: { email: USER.email } }))).user;

    await test.step('POST /createAccount registers the user', async () => {
      expect(await body(request.post(`${BASE}/createAccount`, { form: PROFILE })))
        .toEqual({ responseCode: 201, message: 'User created!' });
    });

    await test.step('POST /verifyLogin authenticates the new credentials', async () => {
      expect(await body(request.post(`${BASE}/verifyLogin`, { form: USER })))
        .toEqual({ responseCode: 200, message: 'User exists!' });
    });

    await test.step('GET /getUserDetailByEmail round-trips every profile field', async () => {
      const user = await getUser();
      expect(user).toMatchObject(PROFILE_ECHO);
      expect(user.password).toBeUndefined(); // credentials must never be echoed back
    });

    await test.step('PUT /updateAccount persists a change of city', async () => {
      expect(await body(request.put(`${BASE}/updateAccount`, { form: { ...PROFILE, city: 'San Diego' } })))
        .toEqual({ responseCode: 200, message: 'User updated!' });
      // The re-read must show the new city — and everything else unchanged.
      expect(await getUser()).toMatchObject({ ...PROFILE_ECHO, city: 'San Diego' });
    });

    await test.step('DELETE /deleteAccount removes the user (cleanup)', async () => {
      expect(await body(request.delete(`${BASE}/deleteAccount`, { form: USER })))
        .toEqual({ responseCode: 200, message: 'Account deleted!' });
      expect(await body(request.post(`${BASE}/verifyLogin`, { form: USER })))
        .toEqual({ responseCode: 404, message: 'User not found!' }); // deletion verified, not just fired
    });
  });

  // Contract check: shape over content. The catalogue's contents change freely;
  // the schema must not — and every record is validated, not just the first.
  test('GET /productsList returns a well-formed catalogue', async ({ request }) => {
    const catalogue = await body(request.get(`${BASE}/productsList`));
    expect(catalogue.responseCode).toBe(200);
    expect(catalogue.products.length).toBeGreaterThan(0);

    for (const product of catalogue.products) {
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

  // Error paths are part of the contract too. Table-driven, so covering a new
  // failure mode is one added row, not a new test.
  test('malformed requests fail with the documented error contract', async ({ request }) => {
    const cases: [string, () => Promise<APIResponse>, { responseCode: number; message: string }][] = [
      ['password omitted',
        () => request.post(`${BASE}/verifyLogin`, { form: { email: USER.email } }),
        { responseCode: 400, message: 'Bad request, email or password parameter is missing in POST request.' }],
      ['search term omitted',
        () => request.post(`${BASE}/searchProduct`),
        { responseCode: 400, message: 'Bad request, search_product parameter is missing in POST request.' }],
      ['unsupported method',
        () => request.delete(`${BASE}/verifyLogin`),
        { responseCode: 405, message: 'This request method is not supported.' }],
    ];

    for (const [name, call, expected] of cases) {
      expect(await body(call()), name).toEqual(expected);
    }
  });
});
