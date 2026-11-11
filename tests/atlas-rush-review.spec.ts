import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { expectIdentifiedCount } from './helpers/atlas-rush';

const expectReadyInput = async (page: Page) => {
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  return input;
};

const setLargeBrowserFont = async (page: Page, browserName: string) => {
  if (browserName !== 'chromium') {
    return;
  }
  const session = await page.context().newCDPSession(page);
  await session.send('Page.setFontSizes', {
    fontSizes: { standard: 32, fixed: 32 },
  });
};

const expectCenterAccessible = async (locator: ReturnType<Page['locator']>) => {
  await locator.scrollIntoViewIfNeeded();
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

const expectCaretAtSelection = async (input: Locator) => {
  await expect
    .poll(() =>
      input.evaluate((element: HTMLInputElement) => {
        const caret = element.parentElement?.querySelector(
          '[data-custom-caret]',
        );
        const context = document.createElement('canvas').getContext('2d');
        if (!caret || !context || element.selectionStart === null) {
          return Infinity;
        }
        const style = getComputedStyle(element);
        context.font = style.font;
        const prefix = element.value
          .slice(0, element.selectionStart)
          .toUpperCase();
        const expected =
          element.getBoundingClientRect().left +
          parseFloat(style.borderLeftWidth) +
          parseFloat(style.paddingLeft) +
          context.measureText(prefix).width -
          element.scrollLeft;
        return Math.abs(caret.getBoundingClientRect().left - expected);
      }),
    )
    .toBeLessThan(4);
};

test('Atlas Rush respects the browser font size on desktop routes', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Font size override requires Chromium');
  await setLargeBrowserFont(page, browserName);
  for (const route of ['/games/atlas-rush/', '/games/atlas-rush/africa/']) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveCSS('font-size', '32px');
  }
});

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
  const settings = dialog.getByRole('button', { name: 'Start over' });
  await expect(replay).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(settings).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(replay).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
});

test.describe('mobile review regressions', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('places the custom caret at the end when switching keyboards', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/games/atlas-rush/africa/?seed=Caret_selection');
    const input = await expectReadyInput(page);
    const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
    const caret = page.locator('[data-answer-input] [data-custom-caret]');
    await keyboard.getByRole('button', { name: 'Use native keyboard' }).click();
    await input.fill('CANADA');
    await input.press('ArrowLeft');
    await input.press('ArrowLeft');
    await input.press('ArrowLeft');
    await expect
      .poll(() =>
        input.evaluate((element: HTMLInputElement) => element.selectionStart),
      )
      .toBe(3);
    await keyboard
      .getByRole('button', { name: 'Use on-screen keyboard' })
      .click();
    await expect(input).toBeFocused();
    await expect
      .poll(() =>
        input.evaluate((element: HTMLInputElement) => element.selectionStart),
      )
      .toBe(6);
    await expect(caret).toBeVisible();
    await expectCaretAtSelection(input);

    await keyboard.getByRole('button', { name: 'B', exact: true }).click();
    await expect(input).toHaveValue('CANADAB');
    await expect
      .poll(() =>
        input.evaluate((element: HTMLInputElement) => element.selectionStart),
      )
      .toBe(7);
    await expectCaretAtSelection(input);

    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
    );
    await input.evaluate((element: HTMLInputElement) =>
      element.setSelectionRange(1, 4),
    );
    await keyboard.getByRole('button', { name: 'Q', exact: true }).click();
    await expect(input).toHaveValue('CQDAB');
    await expectCaretAtSelection(input);
    await keyboard.getByRole('button', { name: 'Use native keyboard' }).focus();
    await expect(caret).toBeHidden();
    await input.focus();
    await expect(caret).toBeVisible();
    await expectCaretAtSelection(input);
  });

  for (const viewport of [{ width: 390, height: 844 }]) {
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
  await expectIdentifiedCount(page, 1, 54);
  await expect(
    page.getByText('Progress could not be saved. Your game can continue.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(input).toBeEnabled();
  expect(errors).toEqual([]);
});
