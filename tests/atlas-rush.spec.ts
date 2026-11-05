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

test('normalizes challenge settings and repeats the same target order on reload', async ({
  page,
}) => {
  await page.goto(
    '/games/atlas-rush/?level=bad&learning=1&seed=Repeat_42&foo=bar',
  );
  await expect(
    page.getByRole('button', { name: 'Start survey' }),
  ).toBeEnabled();
  await expect(page).toHaveURL(/\?learning=1&seed=Repeat_42$/);
  await expect(page.getByLabel('Learning mode')).toBeChecked();
  await page.getByRole('button', { name: 'Start survey' }).click();
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  const targetId = await target.getAttribute('data-country');
  await page.reload();
  await page.getByRole('button', { name: 'Start survey' }).click();
  await expect(target).toHaveAttribute('data-country', targetId ?? '');
});
