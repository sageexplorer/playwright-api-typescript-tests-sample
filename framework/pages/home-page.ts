import { expect, type Page } from '@playwright/test';

/** Landing page of the site. */
export class HomePage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async verifyLoaded() {
    await expect(this.page).toHaveTitle('Automation Exercise');
    await expect(this.page.locator('#slider')).toBeVisible();
  }

  async goToSignupLogin() {
    await this.page.getByRole('link', { name: 'Signup / Login' }).click();
  }
}

/** Product grid ("Features Items") on the home page. */
export class ProductGrid {
  constructor(private readonly page: Page) {}

  async addProductsToCart(count: number) {
    for (let i = 0; i < count; i++) {
      const product = this.page.locator('.features_items .product-image-wrapper').nth(i);
      await product.scrollIntoViewIfNeeded(); // the grid binds its handlers lazily
      await product.locator('.productinfo .add-to-cart').click();

      const modal = this.page.locator('#cartModal');
      await expect(modal).toBeVisible();
      await modal.getByRole('button', { name: 'Continue Shopping' }).click();
      await expect(modal).toBeHidden();
    }
  }
}
