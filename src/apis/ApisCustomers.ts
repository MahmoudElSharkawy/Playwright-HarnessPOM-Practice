import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { step } from 'allure-js-commons';
import { apiUrl } from '../config/targets';
import { ApiActions } from '../utils/ApiActions';
import { expectToBe } from '../utils/Expects';

// Registration inputs used by both the API operation and the registration form.
export type CustomerProfile = {
  name: string;
  title: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  mobile: string;
};

export class ApisCustomers {
  private readonly apiActions: ApiActions;
  // Derived by request name from collection operations 7, 11, 12 and 14.
  private readonly registerCustomer_serviceName = `${apiUrl('app')}/createAccount`;
  private readonly deleteCustomer_serviceName = `${apiUrl('app')}/deleteAccount`;
  private readonly findCustomer_serviceName = `${apiUrl('app')}/getUserDetailByEmail`;
  private readonly checkCredentials_serviceName = `${apiUrl('app')}/verifyLogin`;

  constructor(request: APIRequestContext) {
    this.apiActions = new ApiActions(request);
  }

  ///// Actions

  async registerCustomer(email: string, password: string, profile: CustomerProfile): Promise<APIResponse> {
    return step(`Register the prerequisite customer ${profile.name} by API`, async () =>
      this.apiActions.post(this.registerCustomer_serviceName, {
        form: {
          name: profile.name,
          email,
          password,
          title: profile.title,
          birth_date: profile.birthDay,
          birth_month: profile.birthMonth,
          birth_year: profile.birthYear,
          firstname: profile.firstName,
          lastname: profile.lastName,
          company: profile.company,
          address1: profile.address,
          address2: profile.address2,
          country: profile.country,
          zipcode: profile.zip,
          state: profile.state,
          city: profile.city,
          mobile_number: profile.mobile,
        },
      }),
    );
  }

  async findCustomer(email: string, timeout?: number): Promise<APIResponse> {
    return step('Look up this case’s customer by API', async () =>
      this.apiActions.get(this.findCustomer_serviceName, { params: { email }, timeout }),
    );
  }

  async deleteCustomer(email: string, password: string, timeout?: number): Promise<APIResponse> {
    return step('Delete this case’s owned customer by API', async () =>
      this.apiActions.delete(this.deleteCustomer_serviceName, { form: { email, password }, timeout }),
    );
  }

  async cleanupCustomerIfCreated(email?: string, password?: string): Promise<void> {
    if (!email) return;
    await step('Clean up the customer created by this test and verify absence', async () => {
      // Four bounded requests fit within this project's 60-second teardown budget.
      const cleanupRequestTimeout = 10_000;
      const before = await this.findCustomer(email, cleanupRequestTimeout);
      expectToBe('the cleanup lookup transport status', before.status(), 200);
      const customer = await before.json();
      if (customer.responseCode === 404) return;
      expectToBe('the cleanup lookup body code', customer.responseCode, 200);
      if (!password) throw new Error('Customer cleanup requires the attempted account password.');

      // Email lookup alone cannot establish ownership. Authenticate before deletion.
      const ownership = await this.apiActions.post(this.checkCredentials_serviceName, {
        form: { email, password },
        timeout: cleanupRequestTimeout,
      });
      expectToBe('the ownership check transport status', ownership.status(), 200);
      expectToBe('the attempted credentials own this customer', (await ownership.json()).responseCode, 200);

      const removed = await this.deleteCustomer(email, password, cleanupRequestTimeout);
      expectToBe('the cleanup deletion transport status', removed.status(), 200);
      expectToBe('the cleanup deletion body code', (await removed.json()).responseCode, 200);

      const after = await this.findCustomer(email, cleanupRequestTimeout);
      expectToBe('the final cleanup lookup transport status', after.status(), 200);
      expectToBe('the owned customer is absent after cleanup', (await after.json()).responseCode, 404);
    });
  }

  ///// Validations

  async verifyCustomerRegistered(
    response: APIResponse,
    expected: { status: number; responseCode: number; message: string },
  ): Promise<void> {
    await step('Verify prerequisite account registration succeeded', async () => {
      const body = await response.json();
      expectToBe('the registration transport status', response.status(), expected.status);
      expectToBe('the registration body code', body.responseCode, expected.responseCode);
      expectToBe('the registration confirmation', body.message, expected.message);
    });
  }

  async verifyCustomerPresent(
    response: APIResponse,
    expectedStatus: number,
    expectedCode: number,
    name: string,
  ): Promise<void> {
    await step('Verify the owned prerequisite customer exists', async () => {
      const body = await response.json();
      expectToBe('the lookup transport status', response.status(), expectedStatus);
      expectToBe('the lookup body code', body.responseCode, expectedCode);
      expectToBe('the prerequisite customer name', body.user.name, name);
    });
  }

  async verifyCustomerAbsent(
    response: APIResponse,
    expectedStatus: number,
    expectedCode: number,
  ): Promise<void> {
    await step('Verify the new identity is unregistered', async () => {
      expectToBe('the account lookup transport status', response.status(), expectedStatus);
      expectToBe('the account lookup body code', (await response.json()).responseCode, expectedCode);
    });
  }
}
