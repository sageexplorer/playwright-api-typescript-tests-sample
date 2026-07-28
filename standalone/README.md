# Standalone versions

Two **single self-contained files** — no config, fixtures, page objects, or
test data files. These are the versions shared as two-page work samples;
everything each test needs is inlined so the whole implementation fits on one
page.

| File | What it is |
| --- | --- |
| `place-order.spec.ts` | UI end-to-end — the same TC15 purchase flow as the framework version |
| `api-tests.spec.ts` | REST API — account lifecycle (CRUD), catalogue schema, and negative checks; no browser involved |

Run either on its own with nothing but Playwright installed:

```bash
npm i -D @playwright/test && npx playwright install chromium
npx playwright test place-order.spec.ts
npx playwright test api-tests.spec.ts     # API only — the browser isn't even launched
npx playwright test --grep @smoke         # tag-filtered: @ui, @api, @crud, @contract, @negative
```

(Both are intentionally excluded from the main suite's `testDir`, so `npm test`
at the repo root runs only the framework versions under `tests/`.)
