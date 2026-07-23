import { test } from './fixtures/fixtures';
import { PAYMENT } from './data/test-data';

// Site under test: https://automationexercise.com — Test Case 15: "Place Order: Register before Checkout".
// Page objects are injected via fixtures.ts; see README for design notes.

const PRODUCTS_TO_ADD = 2;

test.describe('Place Order: Register before Checkout (Test Case 15)', () => {
  test('TC15 — end-to-end purchase flow', async ({
    user, header, home, productGrid, signupLogin,
    accountCreation, accountDeleted, cart, checkout, payment,
  }) => {
    console.log(`Submitting TC15 flow with email: ${user.email}`);

    await test.step('Open the home page', async () => {
      await home.open();
      await home.verifyLoaded();
    });

    await test.step('Sign up as a new user', async () => {
      await home.goToSignupLogin();
      await signupLogin.verifyLoaded();
      await signupLogin.startSignup(user);
    });

    await test.step('Fill in account information and create the account', async () => {
      await accountCreation.verifyLoaded();
      await accountCreation.fillAccountDetails(user);
      await accountCreation.createAccount();
    });

    await test.step('Verify the new user is logged in', async () => {
      await header.verifyLoggedInAs(user.name);
    });

    await test.step(`Add ${PRODUCTS_TO_ADD} products to the cart`, async () => {
      await productGrid.addProductsToCart(PRODUCTS_TO_ADD);
    });

    await test.step('Verify the cart contents', async () => {
      await header.goToCart();
      await cart.verifyLoaded();
      await cart.verifyProductCount(PRODUCTS_TO_ADD);
    });

    await test.step('Check out and verify the address and order review', async () => {
      await cart.proceedToCheckout();
      await checkout.verifyLoaded();
      await checkout.verifyDeliveryAddress(user);
      await checkout.verifyOrderProductCount(PRODUCTS_TO_ADD);
    });

    await test.step('Place the order and pay', async () => {
      await checkout.placeOrder('QA automation test order - please disregard.');
      await payment.payWith(PAYMENT);
    });

    await test.step('Verify the order confirmation', async () => {
      await payment.verifyOrderPlaced();
    });

    await test.step('Delete the account and verify logout', async () => {
      await header.deleteAccount();
      await accountDeleted.verifyAccountDeleted();
      await accountDeleted.continueToHome();
      await header.verifyLoggedOut();
    });
  });
});
