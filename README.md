# Automation Exercise — TypeScript / Playwright E2E

Two test cases against https://automationexercise.com, a public demo e-commerce
site that also publishes a REST API:

1. **UI end-to-end** (`tests/place-order.spec.ts`) — Test Case 15 from the
   site's official list: register a new account → verify login → add products
   to cart → verify cart → checkout → verify the delivery address matches the
   data entered at registration → pay → verify order confirmation → delete
   account → verify deletion.
2. **REST API** (`tests/api.spec.ts`) — product catalogue schema validation
   plus negative authentication checks against the site's published API.

Formal test cases (ID, priority, steps, expected results) are documented in
[`TEST_CASES.md`](TEST_CASES.md); each numbered step maps one-to-one onto a
`test.step()` in the corresponding spec.

## Project structure

```
playwright.config.ts        base URL, timeouts, retries, trace/screenshot policy
TEST_CASES.md               formal test cases mapping 1:1 onto the specs
.github/workflows/tests.yml CI: runs the suite headless on every push
tests/
  data/
    test-data.ts            user and payment test data + types
  fixtures/
    fixtures.ts             ad blocking, unique user, cleanup, page-object injection
  pages/                    page objects: one small class per page/component
    header.ts  home-page.ts  account-pages.ts  cart-page.ts  checkout-page.ts  payment-page.ts
  place-order.spec.ts       Test 1 — UI end-to-end (TC15)
  api.spec.ts               Test 2 — REST API checks
```

## Requirements

- Node.js 18+
- Internet access (the tests run against the live site)
- No environment variables or credentials — the UI test generates its own
  throwaway account and deletes it at the end.

## Setup and run

```bash
npm ci
npx playwright install chromium   # one-time browser download

npm test                          # headless; ~8 s total
npm run test:headed               # watch the browser
npm run typecheck                 # tsc --noEmit
```

On failure, a screenshot and a Playwright trace are retained under
`test-results/` (view with `npx playwright show-trace <trace.zip>`).

## Design choices and trade-offs

**Page objects injected through fixtures.** Selectors and page interactions
live in small page-object classes under `tests/pages/`; `fixtures.ts` extends
Playwright's `test` so each spec receives ready-made page objects as
parameters. The test body reads as the official case's step list, selectors
appear in exactly one place, and a DOM change is a one-file fix.

**Selector strategy.** Preference order: the site's own `data-qa="…"` hooks
(purpose-built for automation, most stable) → user-facing role/text selectors
(`getByRole`) → structural CSS only where nothing better exists (the product
grid). No XPath; the only index-based selection is `nth(i)` over the product
grid, where picking the first N products is precisely the intent.

**No sleeps.** Playwright auto-waits on every action and `expect()` retries
until timeout. The assertion timeout is raised to 15 s in
`playwright.config.ts` because the demo site is a free shared host whose
round-trips routinely exceed the 5-second default.

**Third-party ads are blocked at the network layer.** The site is ad-funded;
ad requests slow every navigation, inject click-swallowing overlays, and make
runs nondeterministic. A route handler in `tests/fixtures.ts` aborts requests
to known ad hosts. Trade-off: the page is never tested with ads present —
acceptable, because the ads are third-party content, not functionality under
test.

**Unique account per run, guaranteed cleanup.** The signup email embeds a
random suffix, so repeated runs, retries, and parallel workers never collide.
The account is deleted as the final test step, and the `page` fixture makes a
best-effort deletion when the test fails mid-flow, swallowing errors so
cleanup never masks the real failure.

**Durable-outcome assertions.** The site's "order placed successfully" toast
is visible only for an instant before a redirect, so the test asserts the
outcome the user actually lands on: the `/payment_done` confirmation page.

**Data integrity, not just navigation.** The checkout page's delivery address
is asserted against the exact data entered at registration, and the cart and
order-review tables are asserted to contain exactly the number of products
added — a silent data mix-up fails the test, not just a broken button.

**Narrated reports.** Each phase of the e2e flow is wrapped in `test.step()`,
so reports and traces read as the official test case's step list.

**API quirks asserted deliberately.** The API's transport status is always
HTTP 200 — the real outcome is the `responseCode` field in the JSON body, so
both are asserted. One genuine defect is documented in a comment rather than
asserted: the catalogue endpoint mislabels its JSON body as `text/html`.

**CI included.** `.github/workflows/tests.yml` runs the suite headless on
every push with one retry, uploading traces and screenshots as artifacts on
failure.

## Assumptions

- The live site is reachable and its current DOM (notably the `data-qa`
  attributes) is unchanged.
- The home page product grid shows at least 2 products.
- Payment on the demo site is simulated — any well-formed card data is
  accepted; a standard test Visa number is used.
- "Add products" (plural) in the official case is interpreted as 2 distinct
  products; the count is a constant (`PRODUCTS_TO_ADD`) and easy to change.
