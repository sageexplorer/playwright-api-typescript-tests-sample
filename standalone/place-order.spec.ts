import { test, expect as baseExpect } from '@playwright/test';

// Site under test: https://automationexercise.com — Test Case 15: "Place Order: Register before Checkout".
// Self-contained file. Run: npm i -D @playwright/test && npx playwright install chromium && npx playwright test

const expect = baseExpect.configure({ timeout: 15_000 }); // the demo site is a slow shared host

const AD_HOSTS = ['googlesyndication.com', 'doubleclick.net', 'googleadservices.com',
  'adservice.google.', 'amazon-adsystem.com', 'fundingchoicesmessages.google.com'];
const USER = { name: 'Sage QA', email: `sage.qa.${Date.now()}@example.com` }; // unique per run
const ADDRESS: Record<string, string> = { password: 'Str0ng!Passw0rd', first_name: 'Sage',
  last_name: 'QA', address: '123 Test Street', state: 'California', city: 'Los Angeles',
  zipcode: '90001', mobile_number: '3105550142' };
const CARD: Record<string, string> = { 'name-on-card': 'Sage QA', 'card-number': '4111111111111111',
  cvc: '311', 'expiry-month': '12', 'expiry-year': '2030' };
const PRODUCTS_TO_ADD = 2;

// Third-party ads overlay the page and swallow clicks; abort them for deterministic runs.
test.beforeEach(({ page }) => page.route('**/*', (route) =>
  AD_HOSTS.some((h) => route.request().url().includes(h)) ? route.abort() : route.continue()));

test.describe('Place Order: Register before Checkout (Test Case 15)', () => {
  test('TC15 — end-to-end purchase flow', async ({ page }) => {
    test.setTimeout(120_000);
    const qa = (id: string) => page.locator(`[data-qa="${id}"]`);
    console.log(`Submitting TC15 flow with email: ${USER.email}`);
    await test.step('Register a new account', async () => {
      await page.goto('https://automationexercise.com/');
      await page.getByRole('link', { name: 'Signup / Login' }).click();
      await qa('signup-name').fill(USER.name);
      await qa('signup-email').fill(USER.email);
      await qa('signup-button').click();
      await expect(page.getByText('Enter Account Information')).toBeVisible();
      for (const [field, value] of Object.entries(ADDRESS)) await qa(field).fill(value);
      await qa('country').selectOption('United States');
      await qa('create-account').click();
      await expect(qa('account-created')).toHaveText('Account Created!');
      await qa('continue-button').click();
      await expect(page.locator('header')).toContainText(`Logged in as ${USER.name}`);
    });

    await test.step(`Add ${PRODUCTS_TO_ADD} products to the cart and verify the count`, async () => {
      for (let i = 0; i < PRODUCTS_TO_ADD; i++) {
        const product = page.locator('.features_items .product-image-wrapper').nth(i);
        await product.scrollIntoViewIfNeeded(); // the grid binds its handlers lazily
        await product.locator('.productinfo .add-to-cart').click();
        await page.locator('#cartModal').getByRole('button', { name: 'Continue Shopping' }).click();
        await expect(page.locator('#cartModal')).toBeHidden();
      }
      await page.locator('header').getByRole('link', { name: 'Cart' }).click();
      await expect(page.locator('#cart_info_table tbody tr[id^="product-"]')).toHaveCount(PRODUCTS_TO_ADD);
    });

    await test.step('Check out — the delivery address must match the registration data', async () => {
      await page.getByText('Proceed To Checkout', { exact: true }).click();
      for (const key of ['first_name', 'address', 'city', 'mobile_number'])
        await expect(page.locator('#address_delivery')).toContainText(ADDRESS[key]);
      await expect(page.locator('#cart_info tbody tr[id^="product-"]')).toHaveCount(PRODUCTS_TO_ADD);
    });

    await test.step('Pay and verify the order confirmation', async () => {
      await page.getByRole('link', { name: 'Place Order' }).click();
      for (const [field, value] of Object.entries(CARD)) await qa(field).fill(value);
      await qa('pay-button').click();
      await expect(page).toHaveURL(/\/payment_done/); // durable outcome, not the transient toast
      await expect(qa('order-placed')).toContainText('Order Placed!');
    });
    await test.step('Delete the account (cleanup) and verify logout', async () => {
      await page.locator('header').getByRole('link', { name: 'Delete Account' }).click();
      await expect(qa('account-deleted')).toHaveText('Account Deleted!');
      await qa('continue-button').click();
      await expect(page.locator('header')).toContainText('Signup / Login');
    });
  });
});
