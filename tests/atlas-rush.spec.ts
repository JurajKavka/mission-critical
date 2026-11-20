import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { expectIdentifiedCount } from './helpers/atlas-rush';

type WheelStep = Pick<
  WheelEventInit,
  'clientX' | 'clientY' | 'ctrlKey' | 'deltaMode' | 'deltaX' | 'deltaY'
>;

const dispatchWheel = (surface: Locator, ...steps: WheelStep[]) =>
  surface.evaluate((element, wheelSteps) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return wheelSteps.map(
      (step) =>
        !element.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: x + width / 2,
            clientY: y + height / 2,
            ...step,
          }),
        ),
    );
  }, steps);

const getGlobeDiameter = (globe: Locator) =>
  globe.locator('.globe-ocean').evaluate((ocean: SVGPathElement) => {
    return ocean.getBBox().width * (ocean.getScreenCTM()?.a ?? 0);
  });

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
  const targetId = await target.getAttribute('data-country');
  expect(targetId).toBeTruthy();
  await target.focus();
  const answer = await page.getByRole('status').last().textContent();
  expect(answer).toBeTruthy();
  await page
    .locator('path[data-country]')
    .first()
    .evaluate((element) => {
      (window as Window & { mapPath?: Element }).mapPath = element;
    });
  await page.getByLabel('country name').fill(answer ?? '');
  await page.waitForTimeout(350);
  expect(
    await page
      .locator('path[data-country]')
      .first()
      .evaluate(
        (element) =>
          (window as Window & { mapPath?: Element }).mapPath === element,
      ),
  ).toBe(true);
  await expect(page.getByRole('button', { name: 'Identify' })).toHaveCount(0);
  await expectIdentifiedCount(page, 1, 54);
  await expect(target).toHaveCount(1);
  await expect(target).not.toHaveAttribute('data-country', targetId ?? '');
  await expect(page.getByLabel('country name')).toBeEmpty();
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

test('zooms the highlighted area and resets after a correct answer', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/asia/?learning=1&seed=Zoom');
  const map = page.getByRole('group', { name: /^Asia map/ });
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  await target.focus();
  const answer = await page.getByRole('status').last().textContent();
  expect(answer).toBeTruthy();
  const fullViewBox = await map.getAttribute('viewBox');

  await page
    .getByRole('button', { name: 'Zoom in on highlighted area' })
    .click();
  const zoomedViewBox = await map.getAttribute('viewBox');
  expect(zoomedViewBox).not.toBe(fullViewBox);
  const mapBounds = await map.boundingBox();
  const [, , viewWidth, viewHeight] = (zoomedViewBox ?? '')
    .split(' ')
    .map(Number);
  expect(viewWidth / viewHeight).toBeCloseTo(
    (mapBounds?.width ?? 0) / (mapBounds?.height ?? 1),
    2,
  );
  await page.getByLabel('country name').fill('not a country');
  await page.getByLabel('country name').press('Enter');
  await expect(map).toHaveAttribute('viewBox', zoomedViewBox ?? '');
  await page.getByRole('button', { name: 'Reset map zoom' }).click();
  await expect(map).toHaveAttribute('viewBox', fullViewBox ?? '');

  await page
    .getByRole('button', { name: 'Zoom in on highlighted area' })
    .click();
  await page.getByLabel('country name').fill(answer ?? '');
  await expect(map).toHaveAttribute('viewBox', fullViewBox ?? '');
  await expect(
    page.getByRole('button', { name: 'Zoom in on highlighted area' }),
  ).toBeVisible();
});

test('wheel zooms the regional map around the highlighted area and resets the view', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/asia/?learning=1&seed=Zoom');
  const map = page.locator('svg[aria-label^="Asia map"]');
  const input = page.getByLabel('country name');
  const target = map.getByRole('button', { name: 'Reveal the name' });
  const zoom = page.getByRole('button', {
    name: 'Zoom in on highlighted area',
  });
  const reset = page.getByRole('button', { name: 'Reset map view' });
  const fullViewBox = '0 13 120 115';
  await expect(map).toHaveAttribute('viewBox', fullViewBox);
  const targetCenter = await target.evaluate((path: SVGPathElement) => {
    const { x, y, width, height } = path.getBBox();
    const top = path.dataset.country === 'RUS' ? Math.max(13, y) : y;
    return { x: x + width / 2, y: (top + y + height) / 2 };
  });
  await target.focus();
  const answer = (await page.getByRole('status').last().textContent()) ?? '';
  expect(answer).toBeTruthy();
  await input.focus();
  const hint = page.getByRole('status').filter({ hasText: answer });
  await expect(hint).toBeVisible();
  await expect(reset).toHaveCount(0);
  expect(
    await dispatchWheel(map, { deltaY: -120, ctrlKey: true }, { deltaX: -120 }),
  ).toEqual([false, false]);
  expect(await dispatchWheel(input, { deltaY: -120 })).toEqual([false]);

  const mapBox = await map.boundingBox();
  if (!mapBox) {
    throw new Error('Map bounds are unavailable');
  }
  const zoomBox = await zoom.boundingBox();
  await page.mouse.move(
    mapBox.x + mapBox.width / 2 + 25,
    mapBox.y + mapBox.height / 2 - 20,
  );
  await page.mouse.wheel(0, -120);
  await expect(reset).toBeVisible();
  await expect(input).toBeFocused();
  await expect(hint).toBeHidden();
  expect(await zoom.boundingBox()).toEqual(zoomBox);
  const resetBox = await reset.boundingBox();
  expect((resetBox?.x ?? 0) + (resetBox?.width ?? 0)).toBeLessThan(
    zoomBox?.x ?? 0,
  );
  expect(resetBox?.y).toBe(zoomBox?.y);

  const viewBox = (await map.getAttribute('viewBox')) ?? '';
  expect(
    await dispatchWheel(map, {
      deltaY: -10000,
      clientX: mapBox.x + 1,
      clientY: mapBox.y + 1,
    }),
  ).toEqual([true]);
  await expect(map).not.toHaveAttribute('viewBox', viewBox);
  const edgeViewBox = (await map.getAttribute('viewBox')) ?? '';
  const [x, y, width, height] = edgeViewBox.split(' ').map(Number);
  expect(width).toBeCloseTo(15);
  expect(x).toBeCloseTo(
    Math.max(0, Math.min(targetCenter.x - width / 2, 120 - width)),
  );
  expect(y).toBeCloseTo(
    Math.max(13, Math.min(targetCenter.y - height / 2, 128 - height)),
  );
  await dispatchWheel(map, { deltaY: -120 });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(map).toHaveAttribute('viewBox', edgeViewBox);
  const clipBounds = await map
    .locator('clipPath rect')
    .evaluate((rect) =>
      ['x', 'y', 'width', 'height'].map((attribute) =>
        rect.getAttribute(attribute),
      ),
    );
  expect(clipBounds.join(' ')).toBe(edgeViewBox);
  await input.fill('not a country');
  await input.press('Enter');
  await expect(map).toHaveAttribute('viewBox', edgeViewBox);
  await page.keyboard.press('Escape');
  const pause = page.getByRole('dialog', { name: 'End this game?' });
  await expect(pause).toBeVisible();
  await expect(
    page.locator('button[aria-label="Reset map view"]'),
  ).toBeDisabled();
  expect(await dispatchWheel(map, { deltaY: 120 })).toEqual([false]);
  await pause.getByRole('button', { name: 'Continue' }).click();
  await expect(map).toHaveAttribute('viewBox', edgeViewBox);
  await reset.press('Enter');
  await expect(input).toBeFocused();
  await expect(map).toHaveAttribute('viewBox', fullViewBox);

  await zoom.click();
  const targetViewBox = (await map.getAttribute('viewBox')) ?? '';
  await dispatchWheel(
    map,
    { deltaY: -3, deltaMode: 1 },
    { deltaY: -3, deltaMode: 1 },
  );
  await expect(reset).toBeVisible();
  const wheelWidth = Number((await map.getAttribute('viewBox'))?.split(' ')[2]);
  expect(wheelWidth).toBeCloseTo(
    Number(targetViewBox.split(' ')[2]) * Math.exp(-0.192),
  );
  await zoom.click();
  await expect(reset).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset map zoom' }).click();
  await expect(map).toHaveAttribute('viewBox', fullViewBox);
  await dispatchWheel(map, { deltaY: -120 });
  await expect(reset).toBeVisible();
  await dispatchWheel(map, { deltaY: 3, deltaMode: 2 });
  await expect(reset).toHaveCount(0);
  await expect(map).toHaveAttribute('viewBox', fullViewBox);

  await dispatchWheel(map, { deltaY: -120 });
  await expect(reset).toBeVisible();
  await input.fill(answer);
  await expect(map).toHaveAttribute('viewBox', fullViewBox);
  await expect(reset).toHaveCount(0);
});

test('zooming in and resetting the globe center the highlighted country', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games/atlas-rush/world/?learning=1&seed=Touch_capture');
  await page.addStyleTag({ content: 'astro-dev-toolbar { display: none; }' });
  const globe = page.getByRole('group', { name: /^World globe/ });
  const input = page.getByLabel('country name');
  const target = globe.locator('[data-target="true"]');
  const zoom = page.getByRole('button', {
    name: 'Zoom in on highlighted country',
  });
  const reset = page.getByRole('button', { name: 'Reset globe view' });
  const fullViewBox = '0 0 500 500';
  const dragGlobe = async () => {
    const before = await target.getAttribute('d');
    const globeBox = await globe.boundingBox();
    if (!globeBox) {
      throw new Error('Globe bounds are unavailable');
    }
    const x = globeBox.x + globeBox.width / 2;
    const y = globeBox.y + globeBox.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 40, y, { steps: 3 });
    await page.mouse.up();
    await expect.poll(() => target.getAttribute('d')).not.toBe(before);
  };
  await expect(target).toHaveAttribute('d', /.+/);
  await input.focus();
  const fullDiameter = await getGlobeDiameter(globe);
  const centeredPath = await target.getAttribute('d');
  await globe.hover();
  await page.mouse.wheel(0, -120);
  await expect(reset).toBeVisible();
  await expect(input).toBeFocused();
  expect(await getGlobeDiameter(globe)).toBeGreaterThan(fullDiameter);
  const zoomedPath = await target.getAttribute('d');
  await dragGlobe();

  await dispatchWheel(globe, { deltaY: 120 });
  await expect(globe).toHaveAttribute('viewBox', fullViewBox);
  await expect(reset).toHaveCount(0);
  await expect(target).not.toHaveAttribute('d', centeredPath ?? '');
  await dispatchWheel(globe, { deltaY: -120 });
  await expect(reset).toBeVisible();
  await expect(target).toHaveAttribute('d', zoomedPath ?? '');
  await dispatchWheel(globe, { deltaY: -10000 });
  await expect
    .poll(async () => (await getGlobeDiameter(globe)) / fullDiameter)
    .toBeCloseTo(8);
  await dragGlobe();
  await reset.click();
  await expect(input).toBeFocused();
  await expect(globe).toHaveAttribute('viewBox', fullViewBox);
  await expect(target).toHaveAttribute('d', centeredPath ?? '');
  await globe.getByRole('button', { name: 'Reveal the name' }).press('Enter');
  await expect(page.getByRole('status').last()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await zoom.click();
  await expect(globe).not.toHaveAttribute('viewBox', fullViewBox);
  const targetDiameter = await getGlobeDiameter(globe);
  await dispatchWheel(globe, { deltaY: -48 });
  await expect(reset).toBeVisible();
  expect((await getGlobeDiameter(globe)) / targetDiameter).toBeCloseTo(
    Math.exp(0.096),
  );
  await zoom.click();
  await expect(reset).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset globe zoom' }).click();
  await expect(globe).toHaveAttribute('viewBox', fullViewBox);
  await dispatchWheel(globe, { deltaY: -120 });
  await expect(reset).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(globe).toHaveAttribute('viewBox', fullViewBox);
  await expect(reset).toHaveCount(0);
});

test.describe('mobile keyboard', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('keeps an incorrect answer unselected after submitting', async ({
    page,
  }) => {
    await page.goto('/games/atlas-rush/africa/?seed=Incorrect_answer');
    const input = page.getByLabel('country name');
    const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
    await expect(input).toBeEnabled();
    await keyboard.getByRole('button', { name: 'Q', exact: true }).click();
    await input.press('Enter');
    await expect(input).toBeFocused();
    await keyboard.getByRole('button', { name: 'Q', exact: true }).click();
    await expect(input).toHaveValue('QQ');
  });

  test('keeps controls below the answer and edits only at the end on mobile', async ({
    page,
  }) => {
    page.setDefaultTimeout(5000);
    await page.goto('/games/atlas-rush/africa/?learning=1&seed=Mobile_1');
    await page.addStyleTag({ content: 'astro-dev-toolbar { display: none; }' });
    const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
    const input = page.getByLabel('country name');
    await expect(keyboard).toBeVisible();
    await expect(input).toHaveAttribute('readonly', '');
    const keyboardBounds = await keyboard.boundingBox();
    const inputBounds = await input.boundingBox();
    expect(keyboardBounds).not.toBeNull();
    expect(inputBounds).not.toBeNull();
    expect(
      (inputBounds?.y ?? 0) + (inputBounds?.height ?? 0),
    ).toBeLessThanOrEqual(keyboardBounds?.y ?? 0);
    await test.step('type and delete using the touch keyboard', async () => {
      await keyboard.getByRole('button', { name: 'A', exact: true }).tap();
      await expect(input).toHaveValue('A');
      await keyboard.getByRole('button', { name: 'Space', exact: true }).tap();
      await expect(input).toHaveValue('A ');
      await page.getByRole('button', { name: 'Backspace', exact: true }).tap();
      await expect(input).toHaveValue('A');
    });
    await test.step('accept a connected physical keyboard and skip', async () => {
      await input.pressSequentially('B');
      await expect(input).toHaveValue('AB');
      await keyboard.getByRole('button', { name: 'Skip', exact: true }).tap();
      await expect(input).toHaveValue('');
    });
    await test.step('keep edits at the end after selecting text', async () => {
      await input.pressSequentially('test');
      await input.evaluate((element: HTMLInputElement) =>
        element.setSelectionRange(1, 3),
      );
      await page.getByRole('button', { name: 'Backspace', exact: true }).tap();
      await expect(input).toHaveValue('tes');
      await expect(input).toHaveAttribute('readonly', '');
      await expect(input).toHaveAttribute('inputmode', 'none');
      await keyboard.getByRole('button', { name: 'A', exact: true }).tap();
      await expect(input).toHaveValue('tesA');
      await page.getByRole('button', { name: 'Backspace', exact: true }).tap();
      await expect(input).toHaveValue('tes');
    });
    const backspace = page.getByRole('button', {
      name: 'Backspace',
      exact: true,
    });
    const backspaceBounds = await backspace.boundingBox();
    expect(backspaceBounds).not.toBeNull();
    await page.mouse.move(
      (backspaceBounds?.x ?? 0) + (backspaceBounds?.width ?? 0) / 2,
      (backspaceBounds?.y ?? 0) + (backspaceBounds?.height ?? 0) / 2,
    );
    await page.mouse.down();
    await expect(input).toHaveValue('', { timeout: 3000 });
    await page.mouse.up();
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
  await expectIdentifiedCount(page, 1, 12);
  const nextId = await target.getAttribute('data-country');
  await waitForSavedCount(page, 1);
  await page.reload();
  await expect(
    page.getByRole('dialog', { name: 'Continue your survey?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expectIdentifiedCount(page, 1, 12);
  await expect(target).toHaveAttribute('data-country', nextId ?? '');
});

test('restores Speed mode progress with the same matching settings', async ({
  page,
}) => {
  await page.goto(
    '/games/atlas-rush/south-america/?learning=1&speed=4&seed=Speed_restore',
  );
  const target = page.locator('path[data-learning-target]');
  await expect(target).toHaveCount(1);
  await target.focus();
  const answer = await page.getByRole('status').last().textContent();
  await page.getByLabel('country name').fill((answer ?? '').slice(0, 4));
  await expectIdentifiedCount(page, 1, 12);
  const nextId = await target.getAttribute('data-country');
  await waitForSavedCount(page, 1);
  await page.reload();
  await page
    .getByRole('dialog', { name: 'Continue your survey?' })
    .getByRole('button', { name: 'Continue' })
    .click();
  await expectIdentifiedCount(page, 1, 12);
  await expect(target).toHaveAttribute('data-country', nextId ?? '');
  await target.focus();
  const nextAnswer = await page.getByRole('status').last().textContent();
  await page.getByLabel('country name').fill((nextAnswer ?? '').slice(0, 4));
  await expectIdentifiedCount(page, 2, 12);
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
  const regions = ['africa', 'asia', 'europe', 'south-america', 'usa'];
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
  await expect(page.getByLabel('End game')).toBeVisible();
  await expect(page.getByLabel('country name')).toBeEnabled();
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
  await expect(page.getByLabel('country name')).toBeEnabled();
  await page.clock.fastForward(37000);
  await page
    .getByRole('dialog', { name: 'Time is up' })
    .getByRole('button', { name: 'Start over' })
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
  const map = page.getByRole('img', { name: /^Africa map/ });
  const zoom = page.getByRole('button', {
    name: 'Zoom in on highlighted area',
  });
  await dispatchWheel(map, { deltaY: -120 });
  await expect(
    page.getByRole('button', { name: 'Reset map view' }),
  ).toBeVisible();
  const mapBounds = await map.boundingBox();
  const zoomBounds = await zoom.boundingBox();
  if (!mapBounds || !zoomBounds) {
    throw new Error('Map or zoom control bounds are unavailable');
  }
  expect(zoomBounds.x + zoomBounds.width).toBeCloseTo(
    mapBounds.x + mapBounds.width,
  );
  expect(zoomBounds.y - mapBounds.y).toBeCloseTo(3);
  await expect(page.getByText('02:43')).toBeVisible();
  const result = page.getByRole('region', { name: 'Time is up' });
  await expect(result.getByText('Africa')).toBeVisible();
  await expect(result.getByText('69%')).toBeVisible();
  await expect(result.getByText('05:00')).toBeVisible();
  await expect(
    result.getByRole('button', { name: 'Play again' }),
  ).toBeVisible();
});
