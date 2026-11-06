import { expect, test } from '@playwright/test';
import { regionTargets } from '../src/games/atlas-rush/data/targets';
import { shuffleTargetIds } from '../src/games/atlas-rush/domain/shuffle';

const AFRICA_IDS = regionTargets.africa.map((target) => target.id);
const CONGO_SEED = Array.from(
  { length: 1000 },
  (_, index) => `Alias_${index}`,
).find((seed) => shuffleTargetIds(AFRICA_IDS, seed)[0] === 'COG');

test('normalizes duplicate, malformed and unknown query values', async ({
  page,
}) => {
  await page.goto(
    '/games/atlas-rush/europe/?level=expert&level=expert&learning=1&seed=%ZZ&region=usa&extra=1',
  );
  await expect(page).toHaveURL(/\/europe\/\?learning=1$/);
  await expect(page.getByRole('group', { name: /Europe map/ })).toBeVisible();
  await expect(page.locator('path[data-learning-target]')).toHaveCount(1);
});

test('accepts an alias and preserves keyboard focus through pause', async ({
  page,
}) => {
  expect(CONGO_SEED).toBeDefined();
  await page.goto(`/games/atlas-rush/africa/?seed=${CONGO_SEED}`);
  const target = page.locator('path[data-country="COG"]');
  await expect(target).toBeVisible();
  const input = page.getByLabel('country name');
  await expect(input).toBeFocused();
  await input.fill('Congo Brazzaville');
  await input.press('Enter');
  await expect(page.getByText('01 / 54')).toBeVisible();
  await page.keyboard.press('Escape');
  const dialog = page.getByRole('dialog', { name: 'End this game?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Continue' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(input).toBeFocused();
});

test('keeps map markers and state insets available', async ({ page }) => {
  await page.goto('/games/atlas-rush/africa/?learning=1&seed=Marker_1');
  await expect(page.locator('path[data-country="CPV"]')).toBeAttached();
  await expect(page.locator('path[data-country="STP"]')).toBeAttached();
  await page.goto('/games/atlas-rush/europe/?learning=1&seed=Marker_2');
  await expect(page.locator('path[data-country="MLT"]')).toBeAttached();
  await expect(page.locator('path[data-country="VAT"]')).toBeAttached();
  await page.goto('/games/atlas-rush/usa/?learning=1&seed=Marker_3');
  await expect(page.locator('path[data-country="US02"]')).toBeAttached();
  await expect(page.locator('path[data-country="US15"]')).toBeAttached();
  await expect(page.locator('path[data-country]')).toHaveCount(50);
});

test('rejects a corrupt stored snapshot and starts a new game', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/');
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('atlas-rush', 1);
      request.onupgradeneeded = () =>
        request.result.createObjectStore('sessions', { keyPath: 'key' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('sessions', 'readwrite');
      transaction.objectStore('sessions').put({
        key: JSON.stringify([1, 'africa', 'beginner', true, 'Corrupt_1']),
        schemaVersion: 1,
        generation: 'old',
        revision: 1,
        updatedAt: 1,
        snapshot: { remainingIds: ['invalid'] },
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
  await page.goto('/games/atlas-rush/africa/?learning=1&seed=Corrupt_1');
  const dialog = page.getByRole('dialog', { name: 'Continue your survey?' });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText('The saved game cannot be restored. Start a new game.'),
  ).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Continue' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Start new' }).click();
  await expect(page.locator('path[data-learning-target]')).toHaveCount(1);
});

test('input has an accessible label and sufficient foreground contrast', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/usa/?seed=Contrast_1');
  const input = page.getByLabel('state name');
  await expect(input).toBeVisible();
  const contrast = await input.evaluate((element) => {
    const css = getComputedStyle(element);
    const luminance = (color: string) => {
      const channels = (color.match(/\d+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const foreground = luminance(css.color);
    const background = luminance(css.backgroundColor);
    return (
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05)
    );
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('unrelated routes and graphics catalogs still load', async ({ page }) => {
  for (const route of [
    '/',
    '/games/asteroids/',
    '/games/asteroids/graphics/',
    '/games/atlas-rush/graphics/',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  }
});

test('finishes a complete South America survey with full coverage', async ({
  page,
}) => {
  await page.goto(
    '/games/atlas-rush/south-america/?learning=1&seed=Complete_1',
  );
  const target = page.locator('path[data-learning-target]');
  const input = page.getByLabel('country name');
  for (
    let index = 0;
    index < regionTargets['south-america'].length;
    index += 1
  ) {
    await expect(target).toHaveCount(1);
    const id = await target.getAttribute('data-country');
    const name = regionTargets['south-america'].find(
      (country) => country.id === id,
    )?.name;
    expect(name).toBeDefined();
    await input.fill(name ?? '');
    await input.press('Enter');
    if (index < regionTargets['south-america'].length - 1) {
      await expect(target).not.toHaveAttribute('data-country', id ?? '');
    }
  }
  const result = page.getByRole('dialog', { name: 'Atlas complete' });
  await expect(result).toBeVisible();
  await expect(result.getByText('100%')).toBeVisible();
  await expect(result.getByText('12 / 12 countries identified')).toBeVisible();
});

test('unknown paths return 404 in the local server without affecting assets', async ({
  page,
}) => {
  const missingRegion = await page.goto('/games/atlas-rush/not-a-region/');
  expect(missingRegion?.status()).toBe(404);
  const futureResult = await page.goto(
    '/games/atlas-rush/results/not-created/',
  );
  expect(futureResult?.status()).toBe(404);
  const asset = await page.request.get('/favicon.svg');
  expect(asset.status()).toBe(200);
});

test('keeps saved progress separate for different challenge seeds', async ({
  page,
}) => {
  await page.goto(
    '/games/atlas-rush/south-america/?learning=1&seed=Separate_A',
  );
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  const id = await target.getAttribute('data-country');
  const name = regionTargets['south-america'].find(
    (country) => country.id === id,
  )?.name;
  expect(name).toBeDefined();
  await page.getByLabel('country name').fill(name ?? '');
  await page.getByLabel('country name').press('Enter');
  await expect(page.getByText('01 / 12')).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('atlas-rush');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const record = await new Promise<unknown>((resolve, reject) => {
          const request = db
            .transaction('sessions')
            .objectStore('sessions')
            .get(
              JSON.stringify([
                1,
                'south-america',
                'beginner',
                true,
                'Separate_A',
              ]),
            );
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        db.close();
        return (
          typeof record === 'object' &&
          record !== null &&
          'snapshot' in record &&
          typeof record.snapshot === 'object' &&
          record.snapshot !== null &&
          'correctCount' in record.snapshot &&
          record.snapshot.correctCount === 1
        );
      }),
    )
    .toBe(true);
  await page.goto(
    '/games/atlas-rush/south-america/?learning=1&seed=Separate_B',
  );
  await expect(page.getByText('00 / 12')).toBeVisible();
  await page.goto(
    '/games/atlas-rush/south-america/?learning=1&seed=Separate_A',
  );
  await page
    .getByRole('dialog', { name: 'Continue your survey?' })
    .getByRole('button', { name: 'Continue' })
    .click();
  await expect(page.getByText('01 / 12')).toBeVisible();
});
