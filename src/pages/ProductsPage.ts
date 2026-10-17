import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive, readAttributeValues, scrollViewport } from '../utils/UiControls';
import {
  expectToBeVisible, expectToBeEnabled, expectToHaveURL, expectToHaveText,
  expectToHaveValue, expectToHaveAttribute, expectNotToHaveCount, expectToHaveMatchingCount,
  expectToHaveAttributeSet, expectToBeAlignedBefore, expectToFitViewportWidth,
  expectToHaveNoHorizontalOverflow, expectToHaveScrolledFrom,
  expectToShowPlaceholder, expectNotToShowPlaceholder,
  expectToBeAdjacent, expectAllToBeVisibleAndEnabled, expectViewportTargetsToReceivePointer,
} from '../utils/Expects';

export class ProductsPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/products`;
  // Locators
  private readonly search_input: Locator;
  private readonly search_button: Locator;
  private readonly continueShopping_button: Locator;
  private readonly catalog_header: Locator;
  private readonly category_header: Locator;
  private readonly productCards_card: Locator;
  private readonly productNames_txt: Locator;
  private readonly productActions_button: Locator;
  private readonly productDetails_link: Locator;

  constructor(page: Page) {
    this.page = page;
    // Stable IDs confirmed through the owned browser's public DOM inspection.
    this.search_input = page.locator('#search_product');
    this.search_button = page.locator('#submit_search');
    this.continueShopping_button = page.getByRole('button', { name: 'Continue Shopping', exact: true });
    this.catalog_header = page.getByRole('heading', { name: /^(All|Searched) Products$/ });
    this.category_header = page.getByRole('heading', { name: 'Category', exact: true });
    this.productCards_card = page.locator('.product-image-wrapper');
    this.productNames_txt = this.productCards_card.locator('.productinfo p');
    this.productActions_button = this.productCards_card.locator('.productinfo').getByText('Add to cart', { exact: true });
    this.productDetails_link = this.productCards_card.getByRole('link', { name: /View Product$/ });
  }

  private addToCart_button(productName: string): Locator {
    return this.page
      .locator('.product-image-wrapper')
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .locator('.productinfo')
      .getByText('Add to cart', { exact: true });
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to Products', async () => gotoInteractive(this.page, this.url));
  }

  async searchProducts(term: string): Promise<void> {
    await step(`Search products for ${term}`, async () => {
      await this.enterSearchTerm(term);
      await this.submitSearch();
    });
  }

  async enterSearchTerm(term: string): Promise<void> {
    await step(`Enter the product search term ${term}`, async () => this.search_input.fill(term));
  }

  async submitSearch(): Promise<void> {
    await step('Submit the product search', async () => this.search_button.click());
  }

  async navigateOnMobile(viewport: { width: number; height: number }): Promise<void> {
    await step(`Open Products at ${viewport.width} by ${viewport.height}`, async () => {
      await this.page.setViewportSize(viewport);
      await this.navigate();
    });
  }

  async getCatalogProductDestinations(): Promise<(string | null)[]> {
    return step('Read every initial product destination for the empty-search comparison', async () =>
      readAttributeValues(this.productDetails_link, 'href'),
    );
  }

  async reachSearchControls(): Promise<void> {
    await step('Reach the product search controls', async () => {
      await this.search_input.scrollIntoViewIfNeeded();
      await this.search_button.scrollIntoViewIfNeeded();
    });
  }

  async reachSearchResults(): Promise<void> {
    await step('Reach the searched product cards', async () => {
      // This samples the start of the layout; it never selects a named business record.
      await this.productCards_card.first().scrollIntoViewIfNeeded();
      await this.page.mouse.move(0, 0);
    });
  }

  async scrollResults(distance: number): Promise<number> {
    return step(`Scroll through product results by ${distance} pixels`, async () => scrollViewport(this.page, distance));
  }

  async addProductToCart(productName: string): Promise<void> {
    await step(`Add ${productName} to the cart`, async () => {
      await this.addToCart_button(productName).click();
      await this.continueShopping_button.click();
    });
  }
  ///// Validations
  async verifyProductAvailable(productName: string): Promise<void> {
    await step(`Verify ${productName} can be added to the cart`, async () => {
      await expectToBeVisible('the product Add to cart action', this.addToCart_button(productName));
      await expectToBeEnabled('the product Add to cart action', this.addToCart_button(productName));
    });
  }

  async verifyCatalog(expectedHeading: string): Promise<void> {
    await step(`Verify Products loads with ${expectedHeading}`, async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the catalog heading', this.catalog_header, expectedHeading);
      await expectNotToHaveCount('the catalog product names', this.productNames_txt, 0, 'product');
    });
  }

  async verifyCatalogListed(expectedProductIds: number[]): Promise<void> {
    await step('Verify the full product list is displayed', async () =>
      expectToHaveAttributeSet(
        'the listed catalog product destinations',
        this.productDetails_link,
        'href',
        expectedProductIds.map(id => `/product_details/${id}`),
      ),
    );
  }

  async verifySearchControls(): Promise<void> {
    await step('Verify the product search input and action are available', async () => {
      await expectToBeVisible('the product search input', this.search_input);
      await expectToBeEnabled('the product search input', this.search_input);
      await expectToBeVisible('the product search action', this.search_button);
      await expectToBeEnabled('the product search action', this.search_button);
      await expectToBeAdjacent('the product search input and action', this.search_input, this.search_button);
    });
  }

  async verifySearchInput(expectedTerm: string): Promise<void> {
    await step(`Verify the product search input contains ${expectedTerm}`, async () =>
      expectToHaveValue('the product search input', this.search_input, expectedTerm),
    );
  }

  async verifySearchedProducts(expectedHeading: string): Promise<void> {
    await step(`Verify ${expectedHeading} contains a product list`, async () => {
      await expectToHaveText('the search results heading', this.catalog_header, expectedHeading);
      await expectNotToHaveCount('the searched product names', this.productNames_txt, 0, 'product');
    });
  }

  async verifyCatalogRestored(expectedDestinations: (string | null)[], expectedHeading: RegExp): Promise<void> {
    await step('Verify empty search displays every initial catalog product', async () => {
      await expectToHaveText('the allowed empty-search heading', this.catalog_header, expectedHeading);
      await expectToHaveAttributeSet('the complete catalog product destinations', this.productDetails_link, 'href', expectedDestinations);
      await expectAllToBeVisibleAndEnabled('the restored product links', this.productDetails_link);
    });
  }

  async verifySearchPlaceholder(expectedPlaceholder: string): Promise<void> {
    await step(`Verify the product search placeholder is ${expectedPlaceholder}`, async () => {
      await expectToHaveAttribute('the product search input', this.search_input, 'placeholder', expectedPlaceholder);
      await expectToShowPlaceholder('the product search input', this.search_input);
    });
  }

  async verifyPlaceholderReplaced(expectedTerm: string): Promise<void> {
    await step(`Verify typing ${expectedTerm} replaces the search placeholder`, async () => {
      await expectToHaveValue('the product search input', this.search_input, expectedTerm);
      await expectNotToShowPlaceholder('the product search input', this.search_input);
    });
  }

  async verifyMobileSearchLayout(): Promise<void> {
    await step('Verify the mobile search controls are aligned and unobstructed', async () => {
      await expectToFitViewportWidth('the product search input', this.search_input);
      await expectToFitViewportWidth('the product search action', this.search_button);
      await expectToBeAlignedBefore('the search controls', this.search_input, this.search_button, this.category_header);
      await expectToHaveNoHorizontalOverflow('the Products page', this.page);
    });
  }

  async verifyMobileResults(): Promise<void> {
    await step('Verify mobile results are readable with reachable product actions', async () => {
      await expectToFitViewportWidth('the product cards', this.productCards_card);
      await expectToFitViewportWidth('the product names', this.productNames_txt);
      await expectToFitViewportWidth('the Add to cart actions', this.productActions_button);
      await expectToFitViewportWidth('the View Product links', this.productDetails_link);
      await expectToHaveMatchingCount('the Add to cart actions', this.productActions_button, this.productNames_txt, 'action');
      await expectToHaveMatchingCount('the View Product links', this.productDetails_link, this.productNames_txt, 'link');
      await expectAllToBeVisibleAndEnabled('Add to cart actions', this.productActions_button);
      await expectAllToBeVisibleAndEnabled('View Product links', this.productDetails_link);
      await expectViewportTargetsToReceivePointer('Add to cart actions', this.productActions_button);
      await expectViewportTargetsToReceivePointer('View Product links', this.productDetails_link);
      await expectToHaveNoHorizontalOverflow('the Products page', this.page);
    });
  }

  async verifyResultsScrolled(previousY: number): Promise<void> {
    await step('Verify result scrolling works without horizontal overflow', async () => {
      await expectToHaveScrolledFrom('the search results', this.page, previousY);
      await expectToHaveNoHorizontalOverflow('the Products page', this.page);
    });
  }
}
