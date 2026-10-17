import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { expectToHaveText, expectToHaveURL, expectToHaveAttributeSet } from '../utils/Expects';

export class BrandProductsPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/brand_products`;
  // Locators
  private readonly brandProducts_header: Locator;
  private readonly productDetails_link: Locator;

  constructor(page: Page) {
    this.page = page;
    this.brandProducts_header = page.getByRole('heading', { name: /Products$/ });
    this.productDetails_link = page.locator('.product-image-wrapper').getByRole('link', { name: /View Product$/ });
  }

  ///// Actions
  async navigate(brand: string): Promise<void> {
    await step(`Navigate to the ${brand} brand products`, async () => gotoInteractive(this.page, `${this.url}/${encodeURI(brand)}`));
  }

  ///// Validations
  async verifyArrival(brand: string): Promise<void> {
    await step(`Verify the ${brand} brand page is open`, async () =>
      expectToHaveURL(this.page, `${this.url}/${encodeURI(brand)}`),
    );
  }

  async verifyHeading(expectedHeading: string): Promise<void> {
    await step(`Verify the brand page heading is ${expectedHeading}`, async () =>
      expectToHaveText('the brand products heading', this.brandProducts_header, expectedHeading),
    );
  }

  async verifyProductsListed(expectedProductIds: number[]): Promise<void> {
    await step('Verify only the brand products are listed', async () =>
      expectToHaveAttributeSet(
        'the listed brand product destinations',
        this.productDetails_link,
        'href',
        expectedProductIds.map(id => `/product_details/${id}`),
      ),
    );
  }
}
