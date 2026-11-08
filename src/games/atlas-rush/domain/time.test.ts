import { describe, expect, it } from 'vitest';
import { pauseGame, resumeGame, startGame } from './session';
import { createConfig } from './test-fixtures';
import { formatTime, getElapsedSeconds, getRemainingSeconds } from './time';

describe('active time', () => {
  it('uses a shared round budget, with fractional precision and bounded elapsed time', () => {
    const session = startGame(createConfig());
    expect(getRemainingSeconds(session, 1.25)).toBe(538.75);
    expect(getElapsedSeconds(session, -10)).toBe(0);
    expect(getRemainingSeconds(session, 540)).toBe(0);
    expect(getRemainingSeconds(session, 10000)).toBe(0);
    expect(getRemainingSeconds(session, Number.POSITIVE_INFINITY)).toBe(0);
    expect(getRemainingSeconds(session, Number.NaN)).toBe(540);
  });

  it('freezes the paused checkpoint and never moves active time backwards after resuming', () => {
    const paused = pauseGame(startGame(createConfig()), 12.5);
    expect(getElapsedSeconds(paused, 10000)).toBe(12.5);
    expect(getRemainingSeconds(paused, 10000)).toBe(527.5);
    const resumed = resumeGame(paused);
    expect(getElapsedSeconds(resumed)).toBe(12.5);
    expect(getElapsedSeconds(resumed, 2)).toBe(12.5);
    expect(getRemainingSeconds(resumed, 13.75)).toBe(526.25);
    expect(getElapsedSeconds(resumed, Number.NaN)).toBe(12.5);
  });

  it.each([
    [-1, '00:00'],
    [0, '00:00'],
    [0.001, '00:01'],
    [30, '00:30'],
    [59.01, '01:00'],
    [60, '01:00'],
    [540, '09:00'],
  ])(
    'formats %s seconds with the original ceiling rule',
    (seconds, formatted) => {
      expect(formatTime(seconds)).toBe(formatted);
    },
  );
});
