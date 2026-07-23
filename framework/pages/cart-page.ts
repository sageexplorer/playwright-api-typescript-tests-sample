import { expect, type Page } from '@playwright/test';

/** Shopping cart page (/view_cart). */
export class CartPage {
  constructor(private readonly page: Page) {}

  async verifyLoaded() {
    await expect(this.page).toHaveURL(/\/view_cart/);
    await expect(this.page.locator('#cart_info_table')).toBeVisible();
  }

  async verifyProductCount(count: number) {
    await expect(
      this.page.locator('#cart_info_table tbody tr[id^="product-"]'),
    ).toHaveCount(count);
  }

  async proceedToCheckout() {
    await this.page.getByText('Proceed To Checkout', { exact: true }).click();
  }
}
