import { expect, test } from '@playwright/test';

test('plays a survey and preserves map paths during typing and timer updates', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/');
  await expect(
    page.getByRole('button', { name: 'Start survey' }),
  ).toBeEnabled();
  await page.getByLabel('Learning mode').check();
  await page.getByRole('button', { name: 'Start survey' }).click();
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  await target.focus();
  const answer = await page.getByRole('status').last().textContent();
  expect(answer).toBeTruthy();
  await page
    .locator('svg path')
    .first()
    .evaluate((element) => {
      (window as Window & { mapPath?: Element }).mapPath = element;
    });
  await page.getByLabel('country name').fill(answer ?? '');
  await page.waitForTimeout(350);
  expect(
    await page
      .locator('svg path')
      .first()
      .evaluate(
        (element) =>
          (window as Window & { mapPath?: Element }).mapPath === element,
      ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Identify' }).click();
  await expect(page.getByText('01 / 54')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'End this game?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(
    page.getByRole('dialog', { name: 'End this game?' }),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Skip' }).click();
});
