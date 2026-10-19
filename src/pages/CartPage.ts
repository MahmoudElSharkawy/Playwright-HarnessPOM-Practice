import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToHaveText, expectToContainText, expectToBeVisible, expectToBeHidden, expectToHaveURL, expectToHaveCount } from '../utils/Expects';

export class CartPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/view_cart`;
  // Locators
  private readonly productNames_link: Locator;
  private readonly emptyCart_msg: Locator;
  private readonly checkout_button: Locator;
  private readonly registerLogin_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productNames_link = page
      .getByRole('row')
      .getByRole('link')
      .filter({ hasText: /[A-Za-z]/ });
    this.emptyCart_msg = page.locator('#empty_cart');
    this.checkout_button = page.getByText('Proceed To Checkout', { exact: true });
    this.registerLogin_link = page.getByRole('link', { name: 'Register / Login', exact: true });
  }

  private product_row(productName: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
  }

  private productQuantity_cell(productName: string): Locator {
    return this.product_row(productName).locator('.cart_quantity');
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to the Shopping Cart', async () => gotoInteractive(this.page, this.url));
  }

  async proceedToCheckout(): Promise<void> {
    await step('Proceed To Checkout', async () => this.checkout_button.click());
  }

  async followRegisterLogin(): Promise<void> {
    await step('Follow the checkout Register / Login path', async () => this.registerLogin_link.click());
  }

  ///// Validations
  async verifyCartEmpty(expectedMessage: string): Promise<void> {
    await step(`Verify the cart is empty: ${expectedMessage}`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToBeVisible('the empty cart message', this.emptyCart_msg);
      await expectToContainText('the empty cart message', this.emptyCart_msg, expectedMessage);
      await expectToBeHidden('Proceed To Checkout', this.checkout_button);
    });
  }

  async verifyProducts(expectedNames: string[]): Promise<void> {
    await step(`Verify cart products: ${expectedNames.join(', ')}`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the cart product names', this.productNames_link, expectedNames);
      await expectToBeVisible('Proceed To Checkout', this.checkout_button);
    });
  }

  async verifyRegisterLoginRequired(expectedPath: string): Promise<void> {
    await step('Verify checkout requires Register / Login', async () => {
      await expectToHaveText('the checkout authentication path', this.registerLogin_link, expectedPath);
      await expectToBeVisible('the checkout authentication path', this.registerLogin_link);
    });
  }

  async verifyProductQuantity(productName: string, expectedQuantity: string): Promise<void> {
    await step(`Verify ${productName} has cart quantity ${expectedQuantity}`, async () => {
      const product = this.product_row(productName);
      await expectToHaveCount('the exact cart product row', product, 1, 'row');
      await expectToHaveText('the cart product quantity', this.productQuantity_cell(productName), expectedQuantity);
    });
  }
}
