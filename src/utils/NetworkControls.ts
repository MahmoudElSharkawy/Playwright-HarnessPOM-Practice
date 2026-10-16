import type { Page } from '@playwright/test';

// Hosts that serve the third-party advertising the application embeds (utils family — technical, no business meaning).
const ADVERTISING_HOSTS = /(^|\.)(googlesyndication\.com|doubleclick\.net|googleadservices\.com|adtrafficquality\.google)$/;

/**
 * Stops the page from loading third-party advertising. The application embeds Google ad
 * interstitials that intermittently cover the page and swallow the next click or key
 * press, which fails any journey that is unrelated to advertising. Blocking the ad
 * hosts removes that race instead of retrying around it; application requests are untouched.
 */
export async function blockThirdPartyAdvertising(page: Page): Promise<void> {
  await page.route(url => ADVERTISING_HOSTS.test(url.hostname), route => route.abort());
}
