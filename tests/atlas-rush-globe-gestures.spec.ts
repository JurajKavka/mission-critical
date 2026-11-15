import { expect, test } from '@playwright/test';

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test('a continuous touch drag survives capture transferring from a globe path', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Touch movement requires Chromium CDP');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games/atlas-rush/world/?seed=Touch_capture');
  await expect(page.getByLabel('country name')).toBeEnabled();
  const globe = page.getByRole('img', { name: /World globe/ });
  const target = globe.locator('[data-target="true"]');
  await expect(target).toHaveAttribute('d', /.+/);
  await globe.scrollIntoViewIfNeeded();
  const bounds = await globe.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) {
    throw new Error('Globe bounds are unavailable');
  }
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  const initialPath = await target.getAttribute('d');
  const session = await page.context().newCDPSession(page);
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
    });
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + 12, y }],
    });
    await expect.poll(() => target.getAttribute('d')).not.toBe(initialPath);
    const firstMovePath = await target.getAttribute('d');

    // This move processes the pending capture transfer. The original path
    // loses capture, but the same finger must keep rotating the globe.
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + 60, y }],
    });
    await expect.poll(() => target.getAttribute('d')).not.toBe(firstMovePath);
    const secondMovePath = await target.getAttribute('d');
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x + 90, y }],
    });
    await expect.poll(() => target.getAttribute('d')).not.toBe(secondMovePath);
  } finally {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
    await session.detach();
  }
});
