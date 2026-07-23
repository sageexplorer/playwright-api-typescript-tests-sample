# Playwright / TypeScript Test Samples

End-to-end and API test automation against https://automationexercise.com,
presented in two forms:

| Folder | What it is |
| --- | --- |
| [`framework/`](framework/) | The full suite: page objects, fixture-injected setup, test data, UI e2e + REST API specs, formal test cases, and CI. Start here to see how I structure automation at scale. |
| [`standalone/`](standalone/) | The same UI flow as one self-contained file — no config or helper files. This is the version shared as a two-page work sample. |

Both validate **Test Case 15, "Place Order: Register before Checkout"** from
the site's official test-case list: register a new account → add products to
the cart → check out → verify the delivery address matches the registration
data → pay → verify the order confirmation → delete the account.

## Quick start

```bash
cd framework
npm ci && npx playwright install chromium
npm test
```

See [`framework/README.md`](framework/README.md) for design decisions and
trade-offs, and [`framework/TEST_CASES.md`](framework/TEST_CASES.md) for the
formal test cases. CI (`.github/workflows/tests.yml`) runs the framework suite
headless on every push.
