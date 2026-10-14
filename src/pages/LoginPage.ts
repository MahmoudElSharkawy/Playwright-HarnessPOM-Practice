import { type Page, type Locator } from '@playwright/test';
import { step } from 'allure-js-commons';
import { applications } from '../config/applications';
import { gotoInteractive } from '../utils/UiControls';
import { focusByTab, tabSequence } from '../utils/KeyboardActions';
import {
  expectToBeVisible,
  expectToHaveText,
  expectToHaveValue,
  expectToHaveSecretValue,
  expectToHaveURL,
  expectToBeTruthy,
  expectToEqual,
  expectToBeEnabled,
} from '../utils/Expects';

export class LoginPage {
  readonly page: Page;
  readonly url = `${applications.app.url}/login`;
  // Locators
  private readonly login_header: Locator;
  private readonly signup_header: Locator;
  private readonly email_input: Locator;
  private readonly password_input: Locator;
  private readonly login_button: Locator;
  private readonly loginError_msg: Locator;
  private readonly signupName_input: Locator;
  private readonly signupEmail_input: Locator;
  private readonly signup_button: Locator;
  private readonly duplicateError_msg: Locator;

  constructor(page: Page) {
    this.page = page;
    this.login_header = page.getByRole('heading', { name: 'Login to your account', exact: true });
    this.signup_header = page.getByRole('heading', { name: 'New User Signup!', exact: true });
    this.email_input = this.login_header
      .locator('..')
      .getByRole('textbox', { name: 'Email Address', exact: true });
    this.password_input = this.login_header.locator('..').getByPlaceholder('Password', { exact: true });
    this.login_button = page.getByRole('button', { name: 'Login', exact: true });
    this.loginError_msg = this.login_header.locator('..').locator('form > p');
    this.signupName_input = this.signup_header
      .locator('..')
      .getByRole('textbox', { name: 'Name', exact: true });
    this.signupEmail_input = this.signup_header
      .locator('..')
      .getByRole('textbox', { name: 'Email Address', exact: true });
    this.signup_button = page.getByRole('button', { name: 'Signup', exact: true });
    this.duplicateError_msg = this.signup_header.locator('..').locator('form > p');
  }

  ///// Actions
  async navigate(): Promise<void> {
    await step('Navigate to Signup / Login', async () => gotoInteractive(this.page, this.url));
  }

  async useSmallViewport(viewport: { width: number; height: number }): Promise<void> {
    await step(`Use viewport ${viewport.width} × ${viewport.height}`, async () =>
      this.page.setViewportSize(viewport),
    );
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await step('Enter the case’s email and protected password', async () => {
      await this.email_input.fill(email);
      await this.password_input.fill(password);
    });
  }

  async submitLogin(): Promise<void> {
    await step('Submit Login', async () => this.login_button.click());
  }

  async login(email: string, password: string): Promise<void> {
    await step('Log in with the case’s credentials', async () => {
      await this.email_input.fill(email);
      await this.password_input.fill(password);
      await this.login_button.click();
    });
  }

  async correctPassword(password: string): Promise<void> {
    await step('Replace the incorrect password and submit Login', async () => {
      await this.password_input.fill(password);
      await this.login_button.click();
    });
  }

  async startSignup(name: string, email: string): Promise<void> {
    await step(`Start registration for ${name}`, async () => {
      await this.signupName_input.fill(name);
      await this.signupEmail_input.fill(email);
      await this.signup_button.click();
    });
  }

  async inspectLoginKeyboardOrder(): Promise<boolean[]> {
    return step('Move keyboard focus through Email, Password and Login', async () =>
      tabSequence(this.page, [this.email_input, this.password_input, this.login_button]),
    );
  }

  async loginWithKeyboard(email: string, password: string): Promise<void> {
    await step('Enter credentials and activate Login with the keyboard', async () => {
      await focusByTab(this.page, this.email_input);
      await this.email_input.pressSequentially(email);
      await this.page.keyboard.press('Tab');
      await this.password_input.pressSequentially(password);
      await this.page.keyboard.press('Tab');
      await this.login_button.press('Enter');
    });
  }

  async reachMobileLoginControls(): Promise<void> {
    await step('Reach each login control on the small viewport', async () => {
      await this.email_input.scrollIntoViewIfNeeded();
      await this.password_input.scrollIntoViewIfNeeded();
      await this.login_button.scrollIntoViewIfNeeded();
    });
  }

  async inspectSignupKeyboardOrder(): Promise<boolean[]> {
    return step('Move keyboard focus through signup Name, Email and Signup', async () =>
      tabSequence(this.page, [this.signupName_input, this.signupEmail_input, this.signup_button]),
    );
  }

  async startSignupWithKeyboard(name: string, email: string): Promise<void> {
    await step(`Start registration for ${name} with keyboard input`, async () => {
      await focusByTab(this.page, this.signupName_input);
      await this.signupName_input.pressSequentially(name);
      await this.page.keyboard.press('Tab');
      await this.signupEmail_input.pressSequentially(email);
      await this.page.keyboard.press('Tab');
      await this.signup_button.press('Enter');
    });
  }

  ///// Validations
  async verifyLoginPage(expectedLoginHeading: string, expectedSignupHeading: string): Promise<void> {
    await step('Verify the guest Signup / Login page', async () => {
      await expectToHaveURL(this.page, this.url);
      await expectToHaveText('the login heading', this.login_header, expectedLoginHeading);
      await expectToHaveText('the signup heading', this.signup_header, expectedSignupHeading);
      await expectToBeVisible('Login', this.login_button);
    });
  }

  async verifyCredentialsReady(
    email: string,
    password: string,
    additionalPassword: string = password,
  ): Promise<void> {
    await step('Verify the required protected credential inputs are available', async () => {
      expectToBeTruthy('the case email input', email);
      expectToBeTruthy('the protected password input is available', Boolean(password));
      expectToBeTruthy('the additional protected credential input is available', Boolean(additionalPassword));
    });
  }

  async verifyEnteredCredentials(email: string, password: string): Promise<void> {
    await step('Verify the login fields retain the entered credentials', async () => {
      await expectToHaveValue('the login email', this.email_input, email);
      await expectToHaveSecretValue('the login password', this.password_input, password);
    });
  }

  async verifyRejectedLogin(expectedMessage: string): Promise<void> {
    await step(`Verify rejected login feedback: ${expectedMessage}`, async () => {
      await expectToHaveText('the login feedback', this.loginError_msg, expectedMessage);
      await expectToBeVisible('the guest login form', this.login_button);
    });
  }

  async verifyKeyboardOrder(proof: boolean[], expectedOrder: boolean[]): Promise<void> {
    await step('Verify keyboard focus reaches all controls in order', async () => {
      expectToEqual('Email, Password and Login focus order', proof, expectedOrder);
    });
  }

  async verifyMobileLoginControls(): Promise<void> {
    await step('Verify login controls are visible and operable on the small viewport', async () => {
      await expectToBeVisible('the login email', this.email_input);
      await expectToBeVisible('the login password', this.password_input);
      await expectToBeVisible('Login', this.login_button);
      await expectToBeEnabled('the login email', this.email_input);
      await expectToBeEnabled('the login password', this.password_input);
      await expectToBeEnabled('Login', this.login_button);
    });
  }

  async verifyDuplicateFeedbackVisible(): Promise<void> {
    await step('Verify duplicate-email feedback is visible', async () => {
      await expectToBeVisible('the duplicate-email feedback', this.duplicateError_msg);
    });
  }

  async verifyDuplicateSignup(expectedMessage: string): Promise<void> {
    await step(`Verify duplicate-email feedback: ${expectedMessage}`, async () => {
      await expectToHaveText('the duplicate-email feedback', this.duplicateError_msg, expectedMessage);
      await expectToBeVisible('the signup form', this.signup_button);
    });
  }
}
