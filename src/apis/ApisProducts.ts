import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { step } from 'allure-js-commons';
import { apiUrl } from '../config/targets';
import { ApiActions } from '../utils/ApiActions';
import { expectToBe, expectToBeGreaterThan } from '../utils/Expects';

// The catalog fields this suite relies on from the product and brand list responses.
type CatalogProduct = { id: number; brand: string; category: { usertype: { usertype: string }; category: string } };
type CatalogBrand = { id: number; brand: string };

export class ApisProducts {
  private readonly apiActions: ApiActions;
  // Derived by request name from collection operations 1 and 3.
  private readonly listProducts_serviceName = `${apiUrl('app')}/productsList`;
  private readonly listBrands_serviceName = `${apiUrl('app')}/brandsList`;

  constructor(request: APIRequestContext) {
    this.apiActions = new ApiActions(request);
  }

  ///// Actions

  async listProducts(): Promise<APIResponse> {
    return step('List the catalog products by API', async () => this.apiActions.get(this.listProducts_serviceName));
  }

  async listBrands(): Promise<APIResponse> {
    return step('List the catalog brands by API', async () => this.apiActions.get(this.listBrands_serviceName));
  }

  async getProductIds(response: APIResponse): Promise<number[]> {
    return step('Read every catalog product id', async () => (await this.readProducts(response)).map(product => product.id));
  }

  async getBrandProductIds(response: APIResponse, brand: string): Promise<number[]> {
    return step(`Read the ids of the ${brand} brand products`, async () =>
      (await this.readProducts(response)).filter(product => product.brand === brand).map(product => product.id),
    );
  }

  async getCategoryProductIds(response: APIResponse, category: string, subCategory: string): Promise<number[]> {
    return step(`Read the ids of the ${category} ${subCategory} products`, async () =>
      (await this.readProducts(response))
        .filter(product => product.category.usertype.usertype === category && product.category.category === subCategory)
        .map(product => product.id),
    );
  }

  async getBrandNames(response: APIResponse): Promise<string[]> {
    return step('Read the distinct catalog brand names', async () => {
      const brands: CatalogBrand[] = (await response.json()).brands;
      return [...new Set(brands.map(entry => entry.brand))];
    });
  }

  private async readProducts(response: APIResponse): Promise<CatalogProduct[]> {
    return (await response.json()).products;
  }

  ///// Validations

  async verifyCatalogRead(response: APIResponse, expected: { status: number; responseCode: number }): Promise<void> {
    await step('Verify the catalog product list was read', async () => {
      expectToBe('the product list transport status', response.status(), expected.status);
      expectToBe('the product list body code', (await response.json()).responseCode, expected.responseCode);
    });
  }

  async verifyBrandListRead(response: APIResponse, expected: { status: number; responseCode: number }): Promise<void> {
    await step('Verify the catalog brand list was read', async () => {
      expectToBe('the brand list transport status', response.status(), expected.status);
      expectToBe('the brand list body code', (await response.json()).responseCode, expected.responseCode);
    });
  }

  async verifyBrandHasProducts(response: APIResponse, brand: string): Promise<void> {
    await step(`Verify the ${brand} brand has associated products`, async () =>
      expectToBeGreaterThan(`the ${brand} brand product count`, (await this.getBrandProductIds(response, brand)).length, 0),
    );
  }

  async verifyCategoryHasProducts(response: APIResponse, category: string, subCategory: string): Promise<void> {
    await step(`Verify the ${category} ${subCategory} sub-category has associated products`, async () =>
      expectToBeGreaterThan(
        `the ${category} ${subCategory} product count`,
        (await this.getCategoryProductIds(response, category, subCategory)).length,
        0,
      ),
    );
  }

  async verifyCategoryHasProductsOutsideBrand(response: APIResponse, category: string, subCategory: string, brand: string): Promise<void> {
    await step(`Verify the ${category} ${subCategory} sub-category has products outside the ${brand} brand`, async () =>
      expectToBeGreaterThan(
        `the ${category} ${subCategory} product count outside the ${brand} brand`,
        (await this.readProducts(response)).filter(
          product =>
            product.category.usertype.usertype === category && product.category.category === subCategory && product.brand !== brand,
        ).length,
        0,
      ),
    );
  }
}
