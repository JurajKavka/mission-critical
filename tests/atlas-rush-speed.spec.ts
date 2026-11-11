import { expect, test } from '@playwright/test';
import { regionTargets } from '../src/games/atlas-rush/data/targets';
import { DEFAULT_PREFIX_LENGTH } from '../src/games/atlas-rush/domain/answer-comparison';
import { normalizeAnswer } from '../src/games/atlas-rush/domain/answers';
import { shuffleTargetIds } from '../src/games/atlas-rush/domain/shuffle';
import { expectIdentifiedCount } from './helpers/atlas-rush';

const AFRICA_IDS = regionTargets.africa.map((target) => target.id);
const CONGO_SEED = Array.from(
  { length: 1000 },
  (_, index) => `Speed_${index}`,
).find((seed) => shuffleTargetIds(AFRICA_IDS, seed)[0] === 'COG');

test('starts Speed mode with the code-defined prefix and retains the mode in settings', async ({
  page,
}) => {
  await page.goto('/games/atlas-rush/');
  await page.getByLabel('Speed mode', { exact: true }).check();
  await expect(page.getByLabel('Matching letters')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start survey' }).click();
  await expect(page).toHaveURL(
    new RegExp(`/africa/\\?speed=${DEFAULT_PREFIX_LENGTH}&seed=[a-f0-9]+$`),
  );
  await expect(page.getByLabel('country name')).toBeEnabled();
  await page.keyboard.press('Escape');
  await page
    .getByRole('dialog', { name: 'End this game?' })
    .getByRole('button', { name: 'End game' })
    .click();
  await expect(page.getByLabel('Speed mode', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Matching letters')).toHaveCount(0);
});

test('automatically completes an alternate name prefix with normalized spelling', async ({
  page,
}) => {
  expect(CONGO_SEED).toBeDefined();
  await page.goto(`/games/atlas-rush/africa/?speed=4&seed=${CONGO_SEED}`);
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Identify' })).toHaveCount(0);
  await input.fill('Con');
  await expectIdentifiedCount(page, 0, 54);
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.fill('CÓ-NG');
  await expectIdentifiedCount(page, 1, 54);
  await expect(input).toBeEmpty();
  await expect(input).toBeFocused();
  await expect(page.locator('#feedback')).toHaveText(
    'Republic of the Congo identified.',
  );
});

test('waits for the configured prefix and for text composition to finish', async ({
  page,
}) => {
  expect(CONGO_SEED).toBeDefined();
  await page.goto(`/games/atlas-rush/africa/?speed=6&seed=${CONGO_SEED}`);
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  await input.fill('Repub');
  await expectIdentifiedCount(page, 0, 54);
  await input.dispatchEvent('compositionstart');
  await input.fill('Republ');
  await expectIdentifiedCount(page, 0, 54);
  await input.dispatchEvent('compositionend', { data: 'Republ' });
  await expectIdentifiedCount(page, 1, 54);
  await expect(input).toBeEmpty();
});

test('briefly disables input while completing the name character by character', async ({
  page,
}) => {
  expect(CONGO_SEED).toBeDefined();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto(`/games/atlas-rush/africa/?speed=6&seed=${CONGO_SEED}`);
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await input.fill('Republ');
  await expect(input).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Skip', exact: true }),
  ).toBeDisabled();
  await expect(input).toHaveValue('Republ');
  await page.clock.runFor(20);
  await expect(input).toHaveValue('Republi');
  await page.clock.runFor(180);
  await expect(input).toHaveValue('Republic of the Congo');
  await expect(input).toBeDisabled();
  await expectIdentifiedCount(page, 0, 54);
  await page.clock.runFor(229);
  await expect(input).toHaveValue('Republic of the Congo');
  await expect(input).toBeDisabled();
  await page.clock.runFor(1);
  await expectIdentifiedCount(page, 1, 54);
  await expect(input).toBeEmpty();
  await expect(input).toBeEnabled();
  await expect(input).toBeFocused();
});

test('cancels completion when pausing with End game without submitting a stale answer', async ({
  page,
}) => {
  expect(CONGO_SEED).toBeDefined();
  await page.clock.install();
  await page.goto(`/games/atlas-rush/africa/?speed=6&seed=${CONGO_SEED}`);
  const input = page.getByLabel('country name');
  await expect(input).toBeEnabled();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
  await input.fill('Republ');
  await expect(input).toBeDisabled();
  await page.getByRole('button', { name: 'End game', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'End this game?' });
  await expect(dialog).toBeVisible();
  await page.clock.runFor(500);
  await expect(dialog).toBeVisible();
  await expect(input).toBeDisabled();
  await expectIdentifiedCount(page, 0, 54);
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(dialog).toBeHidden();
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue('Republ');
  await page.clock.runFor(500);
  await expectIdentifiedCount(page, 0, 54);
  await expect(input).toHaveValue('Republ');
});

test.describe('mobile Speed mode', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('submits from the on-screen keyboard without Enter', async ({
    page,
  }) => {
    await page.goto(
      '/games/atlas-rush/south-america/?learning=1&speed=4&seed=Speed_mobile',
    );
    const target = page.locator('path[data-learning-target]');
    await expect(target).toHaveCount(1);
    const id = await target.getAttribute('data-country');
    const name = regionTargets['south-america'].find(
      (candidate) => candidate.id === id,
    )?.name;
    expect(name).toBeDefined();
    const prefix = normalizeAnswer(name ?? '')
      .slice(0, 4)
      .toUpperCase();
    const keyboard = page.getByRole('group', { name: 'On-screen keyboard' });
    await expect(keyboard).toBeVisible();
    for (const letter of prefix.slice(0, -1)) {
      await keyboard.getByRole('button', { name: letter, exact: true }).click();
    }
    await expectIdentifiedCount(page, 0, 12);
    await keyboard
      .getByRole('button', { name: prefix.slice(-1), exact: true })
      .click();
    await expectIdentifiedCount(page, 1, 12);
    await expect(page.getByLabel('country name')).toBeEmpty();
  });
});
