import { expect, type Page } from '@playwright/test';
import type { User } from '../test-data';

/** Checkout page: address details and order review. */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async verifyLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Address Details' })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Review Your Order' })).toBeVisible();
  }

  /** The delivery address must match the data entered at registration. */
  async verifyDeliveryAddress(user: User) {
    const delivery = this.page.locator('#address_delivery');
    await expect(delivery).toContainText(`${user.firstName} ${user.lastName}`);
    await expect(delivery).toContainText(user.address);
    await expect(delivery).toContainText(user.city);
    await expect(delivery).toContainText(user.mobile);
  }

  async verifyOrderProductCount(count: number) {
    await expect(this.page.locator('#cart_info tbody tr[id^="product-"]')).toHaveCount(count);
  }

  async placeOrder(comment: string) {
    await this.page.locator('textarea[name="message"]').fill(comment);
    await this.page.getByRole('link', { name: 'Place Order' }).click();
  }
}
