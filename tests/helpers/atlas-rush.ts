import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

export const getHudMetricValue = (page: Page, label: string): Locator =>
  page.getByText(label, { exact: true }).locator('..').locator('strong');

export const expectIdentifiedCount = async (
  page: Page,
  correct: number,
  total: number,
): Promise<void> => {
  const value = getHudMetricValue(page, 'Identified');
  const correctText = String(correct).padStart(2, '0');
  const totalText = String(total).padStart(2, '0');
  await expect(value).toBeVisible();
  await expect(value).toHaveText(
    new RegExp(`^${correctText}\\s*/\\s*${totalText}$`),
  );
};
