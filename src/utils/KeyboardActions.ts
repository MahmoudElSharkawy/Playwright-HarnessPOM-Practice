import type {Locator, Page} from '@playwright/test';

/** Real Tab/Shift+Tab navigation, with no programmatic focus or mouse activation. */
export async function focusByTab(page: Page, control: Locator): Promise<void> {
  for (let count=0; count<60; count++) {
    if (await control.evaluate(element=>element===element.ownerDocument.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Keyboard navigation did not reach the requested control within 60 tabs.');
}

/** Records native focus after each Tab movement for a later business assertion. */
export async function tabSequence(page: Page, controls: Locator[]): Promise<boolean[]> {
  await focusByTab(page, controls[0]);
  const proof: boolean[] = [];
  for (let index=0; index<controls.length; index++) {
    if (index) await page.keyboard.press('Tab');
    proof.push(await controls[index].evaluate(element=>element===element.ownerDocument.activeElement));
  }
  return proof;
}

/** Type into a control reached through real Tab navigation; return the observed focus. */
export async function enterByTab(page: Page, control: Locator, value: string): Promise<boolean> {
  await focusByTab(page,control);
  const reached=await control.evaluate(element=>element===element.ownerDocument.activeElement);
  await control.pressSequentially(value);
  return reached;
}

/** Toggle an initially unchecked preference using Space after real Tab navigation. */
export async function checkByTab(page: Page, control: Locator): Promise<boolean> {
  await focusByTab(page,control);
  const reached=await control.evaluate(element=>element===element.ownerDocument.activeElement);
  await page.keyboard.press('Space');
  return reached;
}

/** Select a native option with Home/ArrowDown; DOM inspection only resolves the option index. */
export async function selectByTab(page: Page, control: Locator, value: string): Promise<boolean> {
  const index=await control.evaluate((element,desired)=>Array.from((element as HTMLSelectElement).options).findIndex(option=>option.value===desired),value);
  if(index<0)throw new Error('Requested keyboard option is unavailable.');
  await focusByTab(page,control);
  const reached=await control.evaluate(element=>element===element.ownerDocument.activeElement);
  await page.keyboard.press('Home');
  for(let position=0;position<index;position++)await page.keyboard.press('ArrowDown');
  return reached;
}
