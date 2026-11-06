import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const expectReadyInput = async (page: Page) => {
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  return input;
};

const expectCenterAccessible = async (locator: ReturnType<Page['locator']>) => {
  await expect(locator).toBeInViewport();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const hit = document.elementFromPoint(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        );
        return hit !== null && element.contains(hit);
      }),
    )
    .toBe(true);
};

test('restore prompt receives focus and contains keyboard navigation', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/africa/?seed=Restore_focus');
  await expectReadyInput(page);
  await expect
    .poll(() =>
      page.evaluate(async () => {
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
            record.snapshot !== null,
        );
      }),
    )
    .toBe(true);
  await page.reload();
  const dialog = page.getByRole('dialog', { name: 'Continue your survey?' });
  const continueButton = dialog.getByRole('button', { name: 'Continue' });
  const startNew = dialog.getByRole('button', { name: 'Start new' });
  await expect(continueButton).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(startNew).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(continueButton).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel('country name')).toBeFocused();
});

test('results receive focus and keep keyboard navigation inside the report', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(
    '/games/atlas-rush/south-america/?level=expert&seed=Results_focus',
  );
  await expectReadyInput(page);
  await page.clock.fastForward(37_000);
  const dialog = page.getByRole('dialog', { name: 'Time is up' });
  const replay = dialog.getByRole('button', { name: 'Play again' });
  const copy = dialog.getByRole('button', { name: 'Copy challenge link' });
  await expect(replay).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(copy).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(replay).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
});

test.describe('mobile review regressions', () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const viewport of [
    { width: 844, height: 390 },
    { width: 568, height: 320 },
  ]) {
    test(`landscape map and pause remain usable at ${viewport.width} × ${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto('/games/atlas-rush/africa/?learning=1&seed=Landscape');
      const input = await expectReadyInput(page);
      const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
      const map = page.getByRole('group', { name: /Africa map/ });
      await expectCenterAccessible(map);
      const mapBounds = await map.boundingBox();
      const keyboardBounds = await keyboard.boundingBox();
      const inputBounds = await input.boundingBox();
      await expect
        .poll(() =>
          keyboard
            .getByRole('button', { name: 'Backspace' })
            .evaluate((element) => element.scrollWidth <= element.clientWidth),
        )
        .toBe(true);
      expect(mapBounds?.height).toBeGreaterThan(80);
      expect(
        (mapBounds?.x ?? Infinity) + (mapBounds?.width ?? Infinity),
      ).toBeLessThanOrEqual(keyboardBounds?.x ?? 0);
      expect(
        (keyboardBounds?.y ?? Infinity) + (keyboardBounds?.height ?? Infinity),
      ).toBeLessThanOrEqual(inputBounds?.y ?? 0);
      await expectCenterAccessible(input);
      await keyboard.getByRole('button', { name: 'A', exact: true }).tap();
      await expect(input).toHaveValue('A');
      await page.getByRole('button', { name: 'End game', exact: true }).tap();
      const pause = page.getByRole('dialog', { name: 'End this game?' });
      await expect(pause).toBeVisible();
      await pause.getByRole('button', { name: 'Continue' }).tap();
      await expect(pause).toBeHidden();
    });
  }

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
    { width: 568, height: 320 },
  ]) {
    test(`unavailable storage leaves the answer accessible at ${viewport.width} × ${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        Object.defineProperty(window, 'indexedDB', {
          get: () => {
            throw new Error('Storage denied');
          },
        });
      });
      await page.goto('/games/atlas-rush/africa/?learning=1&seed=Notice');
      const input = await expectReadyInput(page);
      const notice = page.getByRole('status').filter({
        hasText: 'Storage is unavailable.',
      });
      await expect(notice).toBeVisible();
      const map = page.getByRole('group', { name: /Africa map/ });
      await expectCenterAccessible(map);
      expect((await map.boundingBox())?.height).toBeGreaterThan(80);
      await expectCenterAccessible(input);
      await input.tap();
      await expect(input).toBeFocused();
      await page.getByRole('button', { name: 'A', exact: true }).tap();
      await expect(input).toHaveValue('A');
      await page.getByRole('button', { name: 'Use native keyboard' }).tap();
      await expect(input).not.toHaveAttribute('readonly', '');
    });
  }
});

test('an aborted save shows a notice and keeps playing without an unhandled rejection', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      const request = originalPut.apply(this, args);
      const record: unknown = args[0];
      if (
        typeof record === 'object' &&
        record !== null &&
        'snapshot' in record &&
        typeof record.snapshot === 'object' &&
        record.snapshot !== null &&
        'correctCount' in record.snapshot &&
        record.snapshot.correctCount === 1
      ) {
        queueMicrotask(() => this.transaction.abort());
      }
      return request;
    };
  });
  await page.goto('/games/atlas-rush/africa/?learning=1&seed=Aborted_save');
  const input = await expectReadyInput(page);
  await page.locator('[data-learning-target]').focus();
  const answer = await page.getByRole('status').last().textContent();
  expect(answer).toBeTruthy();
  await input.fill(answer ?? '');
  await input.press('Enter');
  await expect(page.getByText('01 / 54')).toBeVisible();
  await expect(
    page.getByText('Progress could not be saved. Your game can continue.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(input).toBeEnabled();
  expect(errors).toEqual([]);
});
