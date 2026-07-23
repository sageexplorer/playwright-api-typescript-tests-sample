import { expect, type Page } from '@playwright/test';
import type { User } from '../data/test-data';

/** Combined signup and login page. */
export class SignupLoginPage {
  constructor(private readonly page: Page) {}

  async verifyLoaded() {
    await expect(this.page.getByText('New User Signup!')).toBeVisible();
  }

  async startSignup(user: User) {
    await this.page.locator('[data-qa="signup-name"]').fill(user.name);
    await this.page.locator('[data-qa="signup-email"]').fill(user.email);
    await this.page.locator('[data-qa="signup-button"]').click();
  }
}

/** "Enter Account Information" form shown after the initial signup. */
export class AccountCreationPage {
  constructor(private readonly page: Page) {}

  private qa(id: string) {
    return this.page.locator(`[data-qa="${id}"]`);
  }

  async verifyLoaded() {
    await expect(this.page.getByText('Enter Account Information')).toBeVisible();
  }

  async fillAccountDetails(user: User) {
    await this.page.locator('#id_gender1').check();
    await this.qa('password').fill(user.password);
    await this.qa('days').selectOption(user.birthDay);
    await this.qa('months').selectOption({ label: user.birthMonth });
    await this.qa('years').selectOption(user.birthYear);
    await this.page.locator('#newsletter').check();
    await this.page.locator('#optin').check();
    await this.qa('first_name').fill(user.firstName);
    await this.qa('last_name').fill(user.lastName);
    await this.qa('company').fill(user.company);
    await this.qa('address').fill(user.address);
    await this.qa('address2').fill(user.address2);
    await this.qa('country').selectOption(user.country);
    await this.qa('state').fill(user.state);
    await this.qa('city').fill(user.city);
    await this.qa('zipcode').fill(user.zipcode);
    await this.qa('mobile_number').fill(user.mobile);
  }

  async createAccount() {
    await this.qa('create-account').click();
    await expect(this.qa('account-created')).toHaveText('Account Created!');
    await this.qa('continue-button').click();
  }
}

/** Account deletion confirmation flow. */
export class AccountDeletedPage {
  constructor(private readonly page: Page) {}

  async verifyAccountDeleted() {
    await expect(this.page.locator('[data-qa="account-deleted"]')).toHaveText('Account Deleted!');
  }

  async continueToHome() {
    await this.page.locator('[data-qa="continue-button"]').click();
  }
}
