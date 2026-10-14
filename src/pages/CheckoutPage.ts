import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { expectToHaveText, expectToHaveURL } from '../utils/Expects';

export class CheckoutPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/checkout`;
  // Locators
  private readonly address_header: Locator;
  private readonly order_header: Locator;
  private readonly deliveryAddress_list: Locator;
  private readonly billingAddress_list: Locator;

  constructor(page: Page) {
    this.page = page;
    this.address_header = page.getByText('Address Details', { exact: true });
    this.order_header = page.getByText('Review Your Order', { exact: true });
    this.deliveryAddress_list = page
      .getByRole('heading', { name: 'Your delivery address', exact: true })
      .locator('xpath=ancestor::ul[1]')
      .locator('li')
      .filter({ hasText: /\S/ });
    this.billingAddress_list = page
      .getByRole('heading', { name: 'Your billing address', exact: true })
      .locator('xpath=ancestor::ul[1]')
      .locator('li')
      .filter({ hasText: /\S/ });
  }

  ///// Validations
  async verifySections(expectedAddress: string, expectedOrder: string): Promise<void> {
    await step('Verify checkout Address Details and Review Your Order', async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the address section', this.address_header, expectedAddress);
      await expectToHaveText('the order section', this.order_header, expectedOrder);
    });
  }

  async verifyDeliveryAddress(expected: string[]): Promise<void> {
    await step('Verify delivery address matches the registered profile', async () => {
      await expectToHaveText('the delivery address lines', this.deliveryAddress_list, expected);
    });
  }

  async verifyBillingAddress(expected: string[]): Promise<void> {
    await step('Verify billing address matches the registered profile', async () => {
      await expectToHaveText('the billing address lines', this.billingAddress_list, expected);
    });
  }
}
