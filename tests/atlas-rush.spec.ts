import { expect, test } from '@playwright/test';

test('plays a survey and preserves map paths during typing and timer updates', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/africa/?learning=1');
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
    '/games/atlas-rush/africa/?level=bad&learning=1&seed=Repeat_42&foo=bar',
  );
  await expect(page).toHaveURL(/\?learning=1&seed=Repeat_42$/);
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  const targetId = await target.getAttribute('data-country');
  await page.reload();
  await expect(target).toHaveAttribute('data-country', targetId ?? '');
});

test('landing starts the selected region with a shareable challenge', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/');
  await page.getByLabel('Europe').check();
  await page.getByLabel('Expert').check();
  await page.getByLabel('Learning mode').check();
  await page.getByRole('button', { name: 'Start survey' }).click();
  await expect(page).toHaveURL(
    /\/games\/atlas-rush\/europe\/\?level=expert&learning=1&seed=[a-f0-9]+$/,
  );
  await expect(page.locator('path[data-learning-target]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'End game' }).last().click();
  await expect(page).toHaveURL(/\/games\/atlas-rush\/$/);
  await expect(
    page.getByRole('button', { name: 'Start survey' }),
  ).toBeEnabled();
  await expect(page.getByLabel('Europe')).toBeChecked();
  await expect(page.getByLabel('Expert')).toBeChecked();
  await expect(page.getByLabel('Learning mode')).toBeChecked();
});

test('region pages have unique query-free canonical metadata', async ({
  page,
}) => {
  const regions = ['africa', 'europe', 'south-america', 'usa'];
  const titles: string[] = [];
  for (const region of regions) {
    await page.goto(`/games/atlas-rush/${region}/?learning=1`);
    titles.push(await page.title());
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/games/atlas-rush/${region}/$`),
    );
    await expect(page.locator('path[data-learning-target]')).toHaveCount(1);
  }
  expect(new Set(titles).size).toBe(regions.length);
  expect((await page.goto('/games/atlas-rush/graphics/'))?.status()).toBe(200);
});
