import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const waitForSavedCount = async (page: Page, count: number): Promise<void> => {
  await expect
    .poll(async () =>
      page.evaluate(async (expectedCount) => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('atlas-rush');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const records = await new Promise<unknown[]>((resolve, reject) => {
          const request = database
            .transaction('sessions')
            .objectStore('sessions')
            .getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        database.close();
        return records.some(
          (record) =>
            typeof record === 'object' &&
            record !== null &&
            'snapshot' in record &&
            typeof record.snapshot === 'object' &&
            record.snapshot !== null &&
            'correctCount' in record.snapshot &&
            record.snapshot.correctCount === expectedCount,
        );
      }, count),
    )
    .toBe(true);
};

test('plays a survey and preserves map paths during typing and timer updates', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/africa/?learning=1');
  await expect(
    page.getByRole('group', { name: 'On-screen keyboard' }),
  ).toHaveCount(0);
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
  await expect(page.getByText('Target 02 / 54')).toBeVisible();
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

test.describe('mobile keyboard', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('keeps controls above the answer, supports editing and the native fallback', async ({
    page,
  }) => {
    await page.goto('/games/atlas-rush/africa/?learning=1&seed=Mobile_1');
    const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
    const input = page.getByLabel('country name');
    await expect(keyboard).toBeVisible();
    await expect(input).toHaveAttribute('readonly', '');
    const keyboardBounds = await keyboard.boundingBox();
    const inputBounds = await input.boundingBox();
    expect(keyboardBounds).not.toBeNull();
    expect(inputBounds).not.toBeNull();
    expect(
      (keyboardBounds?.y ?? 0) + (keyboardBounds?.height ?? 0),
    ).toBeLessThanOrEqual(inputBounds?.y ?? 0);
    await keyboard.getByRole('button', { name: 'A', exact: true }).click();
    await expect(input).toHaveValue('A');
    await keyboard.getByRole('button', { name: 'Space', exact: true }).click();
    await expect(input).toHaveValue('A ');
    await keyboard
      .getByRole('button', { name: 'Backspace', exact: true })
      .click();
    await expect(input).toHaveValue('A');
    const afterTyping = await keyboard.boundingBox();
    expect(afterTyping).toEqual(keyboardBounds);
    await input.focus();
    await page.keyboard.type('B');
    await expect(input).toHaveValue('AB');
    await keyboard.getByRole('button', { name: 'Skip', exact: true }).click();
    await expect(input).toHaveValue('');
    await keyboard.getByRole('button', { name: 'Use native keyboard' }).click();
    await expect(input).not.toHaveAttribute('readonly', '');
    await input.fill('test');
    await expect(input).toHaveValue('test');
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(keyboard).toBeVisible();
    const landscapeInput = await input.boundingBox();
    expect(
      (landscapeInput?.y ?? Infinity) + (landscapeInput?.height ?? Infinity),
    ).toBeLessThanOrEqual(390);
  });
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
  await waitForSavedCount(page, 0);
  await page.reload();
  await page.getByRole('button', { name: 'Start new' }).click();
  await expect(target).toHaveAttribute('data-country', targetId ?? '');
});

test('restores the saved queue and progress on refresh', async ({ page }) => {
  await page.goto('/games/atlas-rush/south-america/?learning=1&seed=Restore_1');
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  await target.focus();
  const answer = await page.getByRole('status').last().textContent();
  await page.getByLabel('country name').fill(answer ?? '');
  await page.getByRole('button', { name: 'Identify' }).click();
  await expect(page.getByText('01 / 12')).toBeVisible();
  const nextId = await target.getAttribute('data-country');
  await waitForSavedCount(page, 1);
  await page.reload();
  await expect(
    page.getByRole('dialog', { name: 'Continue your survey?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('01 / 12')).toBeVisible();
  await expect(target).toHaveAttribute('data-country', nextId ?? '');
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

test('plays when IndexedDB is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get: () => {
        throw new Error('Storage disabled');
      },
    });
  });
  await page.goto('/games/atlas-rush/africa/?learning=1');
  await expect(page.locator('path[data-learning-target]')).toHaveCount(1);
  await expect(
    page.getByText(
      'Storage is unavailable. Your game can continue without saving.',
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
});

test('results show timeout data and support replay and settings', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(
    '/games/atlas-rush/south-america/?level=expert&seed=Results_1',
  );
  await expect(page.locator('path[data-country]')).toHaveCount(12);
  await page.clock.fastForward(37000);
  const result = page.getByRole('dialog', { name: 'Time is up' });
  await expect(result).toBeVisible();
  await expect(result.getByText('South America')).toBeVisible();
  await expect(result.getByText('Expert')).toBeVisible();
  await expect(result.getByText('00:36')).toBeVisible();
  await result.getByRole('button', { name: 'Play again' }).click();
  await expect(page).toHaveURL(
    /\/south-america\/\?level=expert&seed=[a-f0-9]+$/,
  );
  await expect(page.getByLabel('End game')).toBeVisible();
  await page.clock.fastForward(37000);
  await page
    .getByRole('dialog', { name: 'Time is up' })
    .getByRole('button', { name: 'Change settings' })
    .click();
  await expect(page).toHaveURL(/\/games\/atlas-rush\/$/);
  await expect(
    page.getByRole('button', { name: 'Start survey' }),
  ).toBeEnabled();
  await expect(page.getByLabel('South America')).toBeChecked();
  await expect(page.getByLabel('Expert')).toBeChecked();
});

test('graphics catalog renders the shared map, timer and results fixture', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/graphics/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
  await expect(page.locator('path[data-country]')).toHaveCount(54);
  await expect(page.getByText('02:43')).toBeVisible();
  const result = page.getByRole('region', { name: 'Time is up' });
  await expect(result.getByText('Africa')).toBeVisible();
  await expect(result.getByText('69%')).toBeVisible();
  await expect(result.getByText('05:00')).toBeVisible();
  await expect(
    result.getByRole('button', { name: 'Play again' }),
  ).toBeVisible();
});
