import { expect, type Page } from '@playwright/test';

/** Site-wide header bar: login state, cart link, account deletion. */
export class Header {
  constructor(private readonly page: Page) {}

  private get root() {
    return this.page.locator('header');
  }

  async verifyLoggedInAs(username: string) {
    await expect(this.root).toContainText(`Logged in as ${username}`);
  }

  async goToCart() {
    await this.root.getByRole('link', { name: 'Cart' }).click();
  }

  async deleteAccount() {
    await this.root.getByRole('link', { name: 'Delete Account' }).click();
  }

  async verifyLoggedOut() {
    await expect(this.root).toContainText('Signup / Login');
  }
}
