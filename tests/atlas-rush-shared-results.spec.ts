import { expect, test } from '@playwright/test';
import { encodeSharedResult } from '../src/games/atlas-rush/infrastructure/share-result';
import type { GameResults } from '../src/games/atlas-rush/domain/types';

const RESULT: GameResults = {
  challengeVersion: 1,
  config: { regionId: 'usa', level: 'expert', learning: false, seed: 'shared' },
  total: 50,
  correct: 30,
  notGuessed: 20,
  coverage: 60,
  elapsedSeconds: 150,
  finishReason: 'timeout',
};

test('shared result is rendered in the first response', async ({
  request,
  browser,
}) => {
  const path = `/games/atlas-rush/results/shared/${encodeSharedResult(RESULT)}/`;
  const response = await request.get(path);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain('Unverified result');
  expect(html).toContain('30 / 50');
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: new URL(response.url()).origin,
  });
  const page = await context.newPage();
  await page.goto(path);
  await expect(page.getByText('30 / 50')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Try this challenge' }),
  ).toHaveAttribute('href', /seed=shared/);
  await context.close();
});

test('invalid shared result returns a useful 404', async ({ request }) => {
  const response = await request.get(
    '/games/atlas-rush/results/shared/v1.invalid/',
  );
  expect(response.status()).toBe(404);
  expect(await response.text()).toContain('invalid or unsupported');
});

test('finished result is saved and available in the dashboard', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/games/atlas-rush/south-america/?level=expert&seed=history');
  await expect(page.getByLabel('country name')).toBeEnabled();
  await page.clock.fastForward(37000);
  const dialog = page.getByRole('dialog', { name: 'Time is up' });
  await expect(dialog.getByText('Saved on this device.')).toBeVisible();
  await dialog.getByLabel('Display name', { exact: true }).fill('Player');
  await dialog.getByRole('button', { name: 'Save name' }).click();
  await expect(dialog.getByText('Name saved on this device.')).toBeVisible();
  await dialog.getByRole('link', { name: 'My results' }).click();
  await expect(page.getByRole('heading', { name: 'My results' })).toBeVisible();
  await page
    .getByRole('button', { name: 'Details', exact: true })
    .first()
    .click();
  await expect(page.getByLabel('Display name', { exact: true })).toHaveValue(
    'Player',
  );
});
