import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToHaveText, expectToHaveURL, expectToBeVisible, expectToBeEnabled, expectToHaveValue } from '../utils/Expects';

export class CheckoutPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/checkout`;
  // Locators
  private readonly address_header: Locator;
  private readonly order_header: Locator;
  private readonly deliveryAddress_section: Locator;
  private readonly billingAddress_section: Locator;
  private readonly deliveryAddress_list: Locator;
  private readonly billingAddress_list: Locator;
  private readonly orderComment_input: Locator;
  private readonly placeOrder_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.address_header = page.getByText('Address Details', { exact: true });
    this.order_header = page.getByText('Review Your Order', { exact: true });
    this.deliveryAddress_section = page.locator('#address_delivery');
    this.billingAddress_section = page.locator('#address_invoice');
    this.deliveryAddress_list = this.deliveryAddress_section
      .locator('li')
      .filter({ hasText: /\S/ });
    this.billingAddress_list = this.billingAddress_section
      .locator('li')
      .filter({ hasText: /\S/ });
    this.orderComment_input = page.locator('textarea[name="message"]');
    this.placeOrder_link = page.getByRole('link', { name: 'Place Order', exact: true });
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to Checkout with the authenticated cart', async () => gotoInteractive(this.page, this.url));
  }

  async enterOrderComment(comment: string): Promise<void> {
    await step(`Enter the order comment: ${comment}`, async () => this.orderComment_input.fill(comment));
  }

  async placeOrder(): Promise<void> {
    await step('Select Place Order', async () => this.placeOrder_link.click());
  }

  ///// Validations
  async verifySections(expectedAddress: string, expectedOrder: string): Promise<void> {
    await step('Verify checkout Address Details and Review Your Order', async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the address section', this.address_header, expectedAddress);
      await expectToHaveText('the order section', this.order_header, expectedOrder);
      await expectToBeVisible('the address section', this.address_header);
      await expectToBeVisible('the order section', this.order_header);
    });
  }

  async verifyDeliveryAddress(expected: string[]): Promise<void> {
    await step('Verify delivery address matches the registered profile', async () => {
      await expectToBeVisible('the delivery address', this.deliveryAddress_section);
      await expectToHaveText('the delivery address lines', this.deliveryAddress_list, expected);
    });
  }

  async verifyBillingAddress(expected: string[]): Promise<void> {
    await step('Verify billing address matches the registered profile', async () => {
      await expectToBeVisible('the billing address', this.billingAddress_section);
      await expectToHaveText('the billing address lines', this.billingAddress_list, expected);
    });
  }

  async verifyOrderCommentAvailable(): Promise<void> {
    await step('Verify the order comment field is visible and editable', async () => {
      await expectToBeVisible('the order comment field', this.orderComment_input);
      await expectToBeEnabled('the order comment field', this.orderComment_input);
    });
  }

  async verifyOrderComment(expected: string): Promise<void> {
    await step(`Verify the order comment is ${expected}`, async () =>
      expectToHaveValue('the order comment', this.orderComment_input, expected),
    );
  }

  async verifyPlaceOrderAvailable(): Promise<void> {
    await step('Verify Place Order is visible and enabled', async () => {
      await expectToBeVisible('Place Order', this.placeOrder_link);
      await expectToBeEnabled('Place Order', this.placeOrder_link);
    });
  }
}
