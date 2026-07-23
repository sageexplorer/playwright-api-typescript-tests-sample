import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { USER, type User } from './test-data';
import { Header } from './pages/header';
import { HomePage, ProductGrid } from './pages/home-page';
import {
  AccountCreationPage,
  AccountDeletedPage,
  SignupLoginPage,
} from './pages/account-pages';
import { CartPage } from './pages/cart-page';
import { CheckoutPage } from './pages/checkout-page';
import { PaymentPage } from './pages/payment-page';

// Third-party ad/consent hosts blocked at the network layer. The site is ad-funded;
// left alone, ad requests slow every navigation, inject click-swallowing overlays,
// and make runs nondeterministic. None of them are functionality under test.
const BLOCKED_HOSTS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'adservice.google.', // country-specific TLDs: .com, .de, .co.uk, ...
  'amazon-adsystem.com',
  'fundingchoicesmessages.google.com',
];

type Fixtures = {
  user: User;
  header: Header;
  home: HomePage;
  productGrid: ProductGrid;
  signupLogin: SignupLoginPage;
  accountCreation: AccountCreationPage;
  accountDeleted: AccountDeletedPage;
  cart: CartPage;
  checkout: CheckoutPage;
  payment: PaymentPage;
};

export const test = base.extend<Fixtures>({
  /** User data with a unique email so runs, retries, and workers never collide. */
  user: async ({}, use) => {
    await use({
      ...USER,
      email: `sage.qa.${randomUUID().replaceAll('-', '').slice(0, 12)}@example.com`,
    });
  },

  /** Blocks third-party ads, and deletes the account even if the test fails mid-flow. */
  page: async ({ page }, use) => {
    await page.route('**/*', (route) =>
      BLOCKED_HOSTS.some((host) => route.request().url().includes(host))
        ? route.abort()
        : route.continue(),
    );

    await use(page);

    try {
      if (await page.getByRole('link', { name: 'Delete Account' }).count()) {
        await page.goto('/delete_account');
      }
    } catch {
      // best-effort cleanup must never mask the real test failure
    }
  },

  header: async ({ page }, use) => {
    await use(new Header(page));
  },
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productGrid: async ({ page }, use) => {
    await use(new ProductGrid(page));
  },
  signupLogin: async ({ page }, use) => {
    await use(new SignupLoginPage(page));
  },
  accountCreation: async ({ page }, use) => {
    await use(new AccountCreationPage(page));
  },
  accountDeleted: async ({ page }, use) => {
    await use(new AccountDeletedPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  payment: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
});

export { expect };
