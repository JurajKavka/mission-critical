import { describe, expect, it } from 'vitest';
import { getTooltipPosition } from './tooltip-position';

describe('getTooltipPosition', () => {
  const tooltip = { width: 120, height: 40 };
  const viewport = { width: 400, height: 300 };

  it('places the tooltip near its anchor', () => {
    expect(
      getTooltipPosition({ left: 80, top: 70 }, tooltip, viewport),
    ).toEqual({ left: 92, top: 82 });
  });

  it('clamps the right edge and flips above the bottom edge', () => {
    expect(
      getTooltipPosition({ left: 395, top: 295 }, tooltip, viewport),
    ).toEqual({ left: 272, top: 243 });
  });

  it('keeps the tooltip inside the top and left edges', () => {
    expect(
      getTooltipPosition({ left: -30, top: -30 }, tooltip, viewport),
    ).toEqual({ left: 8, top: 8 });
  });
});
