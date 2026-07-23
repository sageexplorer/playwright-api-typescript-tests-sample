import { expect, type Page } from '@playwright/test';
import type { Payment } from '../test-data';

/** Payment form and order confirmation. */
export class PaymentPage {
  constructor(private readonly page: Page) {}

  private qa(id: string) {
    return this.page.locator(`[data-qa="${id}"]`);
  }

  async payWith(payment: Payment) {
    await this.qa('name-on-card').fill(payment.nameOnCard);
    await this.qa('card-number').fill(payment.cardNumber);
    await this.qa('cvc').fill(payment.cvc);
    await this.qa('expiry-month').fill(payment.expiryMonth);
    await this.qa('expiry-year').fill(payment.expiryYear);
    await this.qa('pay-button').click();
  }

  /** The success toast flashes before a redirect; assert the durable outcome. */
  async verifyOrderPlaced() {
    await expect(this.page).toHaveURL(/\/payment_done/);
    await expect(this.qa('order-placed')).toContainText('Order Placed!');
    await expect(
      this.page.getByText('Congratulations! Your order has been confirmed!'),
    ).toBeVisible();
  }
}
