import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import {
  expectToHaveText,
  expectToHaveValue,
  expectToHaveSecretValue,
  expectToBeVisible,
  expectToBeChecked,
  expectNotToBeChecked,
  expectToBeDisabled,
  expectToBeEnabled,
  expectToBeInViewport,
  expectToBeTruthy,
  expectToEqual,
} from '../utils/Expects';
import { focusByTab, enterByTab, checkByTab, selectByTab } from '../utils/KeyboardActions';
import type { CustomerProfile } from '../apis/ApisCustomers';

export class RegistrationPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/signup`;
  // Locators
  private readonly account_header: Locator;
  private readonly title_radio: Locator;
  private readonly name_input: Locator;
  private readonly email_input: Locator;
  private readonly password_input: Locator;
  private readonly day_dropdown: Locator;
  private readonly month_dropdown: Locator;
  private readonly year_dropdown: Locator;
  private readonly newsletter_checkbox: Locator;
  private readonly offers_checkbox: Locator;
  private readonly firstName_input: Locator;
  private readonly lastName_input: Locator;
  private readonly company_input: Locator;
  private readonly address_input: Locator;
  private readonly country_dropdown: Locator;
  private readonly state_input: Locator;
  private readonly city_input: Locator;
  private readonly zip_input: Locator;
  private readonly mobile_input: Locator;
  private readonly createAccount_button: Locator;

  constructor(page: Page) {
    this.page = page;
    this.account_header = page.getByRole('heading', { name: 'Enter Account Information', exact: true });
    this.title_radio = page.getByRole('radio');
    this.name_input = page.getByRole('textbox', { name: 'Name *', exact: true });
    this.email_input = page.getByRole('textbox', { name: 'Email *', exact: true });
    this.password_input = page.getByLabel('Password *', { exact: true });
    this.day_dropdown = page.getByRole('combobox', { name: '', exact: true }).nth(0);
    this.month_dropdown = page.getByRole('combobox', { name: '', exact: true }).nth(1);
    this.year_dropdown = page.getByRole('combobox', { name: '', exact: true }).nth(2);
    this.newsletter_checkbox = page.getByRole('checkbox', {
      name: 'Sign up for our newsletter!',
      exact: true,
    });
    this.offers_checkbox = page.getByRole('checkbox', {
      name: 'Receive special offers from our partners!',
      exact: true,
    });
    this.firstName_input = page.getByRole('textbox', { name: 'First name *', exact: true });
    this.lastName_input = page.getByRole('textbox', { name: 'Last name *', exact: true });
    this.company_input = page.getByRole('textbox', { name: 'Company', exact: true });
    this.address_input = page.getByRole('textbox', {
      name: 'Address * (Street address, P.O. Box, Company name, etc.)',
      exact: true,
    });
    this.country_dropdown = page.getByRole('combobox', { name: 'Country *', exact: true });
    this.state_input = page.getByRole('textbox', { name: 'State *', exact: true });
    this.city_input = page.getByRole('textbox', { name: 'City * Zipcode *', exact: true });
    this.zip_input = page.getByRole('textbox', { name: '', exact: true });
    this.mobile_input = page.getByRole('textbox', { name: 'Mobile Number *', exact: true });
    this.createAccount_button = page.getByRole('button', { name: 'Create Account', exact: true });
  }

  private selectedTitle_radio(title: string): Locator {
    return this.page.getByRole('radio', { name: `${title}.`, exact: true });
  }

  ///// Actions
  async completeDetails(profile: CustomerProfile, password: string): Promise<void> {
    await step(`Complete account and address details for ${profile.name}`, async () => {
      await this.selectedTitle_radio(profile.title).check();
      await this.day_dropdown.selectOption(profile.birthDay);
      await this.month_dropdown.selectOption(profile.birthMonth);
      await this.year_dropdown.selectOption(profile.birthYear);
      await this.password_input.fill(password);
      await this.firstName_input.fill(profile.firstName);
      await this.lastName_input.fill(profile.lastName);
      await this.company_input.fill(profile.company);
      await this.address_input.fill(profile.address);
      await this.country_dropdown.selectOption(profile.country);
      await this.state_input.fill(profile.state);
      await this.city_input.fill(profile.city);
      await this.zip_input.fill(profile.zip);
      await this.mobile_input.fill(profile.mobile);
    });
  }

  async selectBothPreferences(): Promise<void> {
    await step('Select newsletter and partner offers', async () => {
      await this.newsletter_checkbox.check();
      await this.offers_checkbox.check();
    });
  }

  async submitRegistration(): Promise<void> {
    await step('Submit Create Account', async () => this.createAccount_button.click());
  }

  async completeDetailsWithKeyboard(profile: CustomerProfile, password: string): Promise<boolean[]> {
    return step(`Complete ${profile.name}’s required registration fields with the keyboard`, async () => {
      const passwordReached = await enterByTab(this.page, this.password_input, password);
      const newsletterReached = await checkByTab(this.page, this.newsletter_checkbox);
      const offersReached = await checkByTab(this.page, this.offers_checkbox);
      const firstReached = await enterByTab(this.page, this.firstName_input, profile.firstName);
      const lastReached = await enterByTab(this.page, this.lastName_input, profile.lastName);
      const companyReached = await enterByTab(this.page, this.company_input, profile.company);
      const addressReached = await enterByTab(this.page, this.address_input, profile.address);
      const countryReached = await selectByTab(this.page, this.country_dropdown, profile.country);
      const stateReached = await enterByTab(this.page, this.state_input, profile.state);
      const cityReached = await enterByTab(this.page, this.city_input, profile.city);
      const zipReached = await enterByTab(this.page, this.zip_input, profile.zip);
      const mobileReached = await enterByTab(this.page, this.mobile_input, profile.mobile);
      return [
        passwordReached,
        newsletterReached,
        offersReached,
        firstReached,
        lastReached,
        companyReached,
        addressReached,
        countryReached,
        stateReached,
        cityReached,
        zipReached,
        mobileReached,
      ];
    });
  }

  async submitRegistrationWithKeyboard(): Promise<void> {
    await step('Reach Create Account by Tab and activate it with Enter', async () => {
      await focusByTab(this.page, this.createAccount_button);
      await this.createAccount_button.press('Enter');
    });
  }

  async reachMobileAccountForm(): Promise<void> {
    await step('Reach the account information form on the small viewport', async () =>
      this.account_header.scrollIntoViewIfNeeded(),
    );
  }

  async reachMobileRegistrationControls(): Promise<void> {
    await step(
      'Reach registration fields, preferences and Create Account on the small viewport',
      async () => {
        await this.password_input.scrollIntoViewIfNeeded();
        await this.newsletter_checkbox.scrollIntoViewIfNeeded();
        await this.offers_checkbox.scrollIntoViewIfNeeded();
        await this.firstName_input.scrollIntoViewIfNeeded();
        await this.lastName_input.scrollIntoViewIfNeeded();
        await this.company_input.scrollIntoViewIfNeeded();
        await this.address_input.scrollIntoViewIfNeeded();
        await this.country_dropdown.scrollIntoViewIfNeeded();
        await this.state_input.scrollIntoViewIfNeeded();
        await this.city_input.scrollIntoViewIfNeeded();
        await this.zip_input.scrollIntoViewIfNeeded();
        await this.mobile_input.scrollIntoViewIfNeeded();
        await this.createAccount_button.scrollIntoViewIfNeeded();
      },
    );
  }

  ///// Validations

  async verifyProfileReady(profile: CustomerProfile): Promise<void> {
    await step('Verify the source customer and required address inputs are ready', async () => {
      expectToBeTruthy('signup name', profile.name);
      expectToBeTruthy('first name', profile.firstName);
      expectToBeTruthy('last name', profile.lastName);
      expectToBeTruthy('address', profile.address);
      expectToBeTruthy('country', profile.country);
      expectToBeTruthy('state', profile.state);
      expectToBeTruthy('city', profile.city);
      expectToBeTruthy('ZIP', profile.zip);
      expectToBeTruthy('mobile', profile.mobile);
    });
  }

  async verifyKeyboardDetails(
    proof: boolean[],
    expectedOrder: boolean[],
    profile: CustomerProfile,
    password: string,
  ): Promise<void> {
    await step('Verify real keyboard focus and entered registration values', async () => {
      expectToEqual('focus reached each required field and preference', proof, expectedOrder);
      await expectToHaveValue('signup name', this.name_input, profile.name);
      await expectToHaveSecretValue('registration password', this.password_input, password);
      await expectToHaveValue('first name', this.firstName_input, profile.firstName);
      await expectToHaveValue('last name', this.lastName_input, profile.lastName);
      await expectToHaveValue('company', this.company_input, profile.company);
      await expectToHaveValue('address', this.address_input, profile.address);
      await expectToHaveValue('country', this.country_dropdown, profile.country);
      await expectToHaveValue('state', this.state_input, profile.state);
      await expectToHaveValue('city', this.city_input, profile.city);
      await expectToHaveValue('ZIP', this.zip_input, profile.zip);
      await expectToHaveValue('mobile', this.mobile_input, profile.mobile);
    });
  }

  async verifyMobileAccountForm(heading: string, viewport: { width: number; height: number }): Promise<void> {
    await step('Verify the account form remains usable on the small viewport', async () => {
      expectToEqual('the requested small viewport', this.page.viewportSize(), viewport);
      await expectToHaveText('the account heading', this.account_header, heading);
      await expectToBeInViewport('the account heading', this.account_header);
      await expectToBeVisible('signup name', this.name_input);
      await expectToBeEnabled('signup name', this.name_input);
      await expectToBeEnabled('registration password', this.password_input);
      await expectToBeEnabled('Create Account', this.createAccount_button);
    });
  }

  async verifyMobileRegistrationControls(viewport: { width: number; height: number }): Promise<void> {
    await step('Verify registration controls remain usable on the small viewport', async () => {
      expectToEqual('the requested small viewport', this.page.viewportSize(), viewport);
      await expectToBeEnabled('password', this.password_input);
      await expectToBeEnabled('newsletter', this.newsletter_checkbox);
      await expectToBeEnabled('partner offers', this.offers_checkbox);
      await expectToBeEnabled('first name', this.firstName_input);
      await expectToBeEnabled('last name', this.lastName_input);
      await expectToBeEnabled('company', this.company_input);
      await expectToBeEnabled('address', this.address_input);
      await expectToBeEnabled('country', this.country_dropdown);
      await expectToBeEnabled('state', this.state_input);
      await expectToBeEnabled('city', this.city_input);
      await expectToBeEnabled('ZIP', this.zip_input);
      await expectToBeEnabled('mobile', this.mobile_input);
      await expectToBeVisible('Create Account', this.createAccount_button);
      await expectToBeInViewport('Create Account', this.createAccount_button);
      await expectToBeEnabled('Create Account', this.createAccount_button);
    });
  }

  async verifyAccountForm(expectedHeading: string): Promise<void> {
    await step('Verify the account information form is available', async () => {
      await expectToHaveText('the account form heading', this.account_header, expectedHeading);
      await expectToBeVisible('Create Account', this.createAccount_button);
    });
  }

  async verifyCompletedDetails(profile: CustomerProfile, password: string): Promise<void> {
    await step(`Verify the registration form retains ${profile.name}’s details`, async () => {
      await expectToHaveValue('the registered name', this.name_input, profile.name);
      await expectToBeChecked('the selected title', this.selectedTitle_radio(profile.title));
      await expectToHaveValue('the birth day', this.day_dropdown, profile.birthDay);
      await expectToHaveValue('the birth month', this.month_dropdown, profile.birthMonth);
      await expectToHaveValue('the birth year', this.year_dropdown, profile.birthYear);
      await expectToHaveSecretValue('the registration password', this.password_input, password);
      await expectToHaveValue('the first name', this.firstName_input, profile.firstName);
      await expectToHaveValue('the last name', this.lastName_input, profile.lastName);
      await expectToHaveValue('the company', this.company_input, profile.company);
      await expectToHaveValue('the address', this.address_input, profile.address);
      await expectToHaveValue('the country', this.country_dropdown, profile.country);
      await expectToHaveValue('the state', this.state_input, profile.state);
      await expectToHaveValue('the city', this.city_input, profile.city);
      await expectToHaveValue('the ZIP', this.zip_input, profile.zip);
      await expectToHaveValue('the mobile number', this.mobile_input, profile.mobile);
    });
  }

  async verifyAccountControls(): Promise<void> {
    await step('Verify supported account information controls', async () => {
      await expectToBeVisible('the title choices', this.title_radio.nth(0));
      await expectToBeVisible('the name', this.name_input);
      await expectToBeVisible('the email', this.email_input);
      await expectToBeDisabled('the signup email', this.email_input);
      await expectToBeVisible('the password', this.password_input);
      await expectToBeVisible('the day', this.day_dropdown);
      await expectToBeVisible('the month', this.month_dropdown);
      await expectToBeVisible('the year', this.year_dropdown);
    });
  }

  async verifyAddressControls(): Promise<void> {
    await step('Verify supported contact and address controls', async () => {
      await expectToBeVisible('the first name', this.firstName_input);
      await expectToBeVisible('the last name', this.lastName_input);
      await expectToBeVisible('the company', this.company_input);
      await expectToBeVisible('the address', this.address_input);
      await expectToBeVisible('the country', this.country_dropdown);
      await expectToBeVisible('the state', this.state_input);
      await expectToBeVisible('the city', this.city_input);
      await expectToBeVisible('the ZIP', this.zip_input);
      await expectToBeVisible('the mobile number', this.mobile_input);
    });
  }

  async verifySelectedPreferences(): Promise<void> {
    await step('Verify both optional preferences are selected', async () => {
      await expectToBeChecked('newsletter', this.newsletter_checkbox);
      await expectToBeChecked('partner offers', this.offers_checkbox);
    });
  }

  async verifyUncheckedPreferences(): Promise<void> {
    await step('Verify optional preferences remain unchecked and registration is available', async () => {
      await expectNotToBeChecked('newsletter', this.newsletter_checkbox);
      await expectNotToBeChecked('partner offers', this.offers_checkbox);
      await expectToBeVisible('Create Account', this.createAccount_button);
    });
  }
}
