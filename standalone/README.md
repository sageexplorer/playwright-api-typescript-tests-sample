# Standalone version

The same TC15 flow as a **single self-contained file** — no config, fixtures,
page objects, or test data files. This is the version shared as the two-page
work sample; everything the test needs is inlined so the whole implementation
fits on one page.

Run it on its own with nothing but Playwright installed:

```bash
npm i -D @playwright/test && npx playwright install chromium
npx playwright test place-order.spec.ts
```

(It is intentionally excluded from the main suite's `testDir`, so `npm test`
at the repo root runs only the framework version under `tests/`.)
