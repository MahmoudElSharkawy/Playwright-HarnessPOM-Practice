import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { focusByTab } from '../utils/KeyboardActions';
import { expectToBeVisible, expectToBeHidden, expectToHaveText, expectToBeEnabled } from '../utils/Expects';

export class HeaderPage {
  readonly page: Page;
  // Locators
  private readonly signupLogin_link: Locator;
  private readonly logout_link: Locator;
  private readonly deleteAccount_link: Locator;
  private readonly cart_link: Locator;
  private readonly products_link: Locator;
  private readonly customer_txt: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signupLogin_link = page.getByRole('link', { name: /Signup \/ Login$/ });
    this.logout_link = page.getByRole('link', { name: /Logout$/ });
    this.deleteAccount_link = page.getByRole('link', { name: /Delete Account$/ });
    this.cart_link = page.getByRole('link', { name: /Cart$/ });
    this.products_link = page.getByRole('link', { name: /Products$/ });
    this.customer_txt = page.getByText(/Logged in as /);
  }

  ///// Actions
  async openLogin(): Promise<void> {
    await step('Open Signup / Login', async () => this.signupLogin_link.click());
  }

  async openCart(): Promise<void> {
    await step('Open the Cart', async () => this.cart_link.click());
  }

  async openProducts(): Promise<void> {
    await step('Open Products', async () => this.products_link.click());
  }

  async logout(): Promise<void> {
    await step('Log out of the customer session', async () => this.logout_link.click());
  }

  async deleteAccount(): Promise<void> {
    await step('Delete the signed-in test account', async () => this.deleteAccount_link.click());
  }

  async logoutWithKeyboard(): Promise<void> {
    await step('Reach and activate Logout with the keyboard', async () => {
      await focusByTab(this.page, this.logout_link);
      await this.logout_link.press('Enter');
    });
  }

  async reachMobileHeader(): Promise<void> {
    await step('Reach the customer header and Logout on the small viewport', async () => {
      await this.customer_txt.scrollIntoViewIfNeeded();
      await this.logout_link.scrollIntoViewIfNeeded();
    });
  }

  ///// Validations
  async verifyGuest(): Promise<void> {
    await step('Verify the customer remains unauthenticated', async () => {
      await expectToBeVisible('Signup / Login', this.signupLogin_link);
      await expectToBeHidden('the authenticated customer header', this.customer_txt);
      await expectToBeHidden('Logout', this.logout_link);
    });
  }

  async verifyAuthenticated(expectedHeader: string): Promise<void> {
    await step(`Verify authenticated header: ${expectedHeader}`, async () => {
      await expectToHaveText('the customer header', this.customer_txt, expectedHeader);
      await expectToBeVisible('Logout', this.logout_link);
      await expectToBeHidden('Signup / Login', this.signupLogin_link);
    });
  }

  async verifyDeletionAvailable(): Promise<void> {
    await step('Verify Delete Account is available for this signed-in customer', async () => {
      await expectToBeVisible('Delete Account', this.deleteAccount_link);
      await expectToBeEnabled('Delete Account', this.deleteAccount_link);
    });
  }

  async verifyMobileHeader(expectedHeader: string): Promise<void> {
    await step('Verify the authenticated mobile header and Logout are reachable', async () => {
      await expectToHaveText('the customer header', this.customer_txt, expectedHeader);
      await expectToBeVisible('the customer header', this.customer_txt);
      await expectToBeVisible('Logout', this.logout_link);
      await expectToBeEnabled('Logout', this.logout_link);
    });
  }
}
