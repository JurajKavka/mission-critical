import { describe, expect, it } from 'vitest';
import type { GameResults } from '../domain/types';
import { decodeSharedResult, encodeSharedResult } from './share-result';

const RESULT: GameResults = {
  challengeVersion: 1,
  config: {
    regionId: 'usa',
    level: 'expert',
    learning: false,
    seed: 'example',
  },
  total: 50,
  correct: 30,
  notGuessed: 20,
  coverage: 60,
  elapsedSeconds: 150,
  finishReason: 'timeout',
};

describe('shared results', () => {
  it('round trips Unicode names and preserves challenge settings', () => {
    const decoded = decodeSharedResult(encodeSharedResult(RESULT, 'Žofia 🗺'));
    expect(decoded?.displayName).toBe('Žofia 🗺');
    expect(decoded?.result.correct).toBe(30);
    expect(decoded?.result.config.seed).toBe('example');
    expect(decoded?.result.coverage).toBe(60);
  });

  it('rejects malformed, oversized and inconsistent payloads', () => {
    expect(decodeSharedResult('v2.abc')).toBeNull();
    expect(decodeSharedResult(`v1.${'a'.repeat(1024)}`)).toBeNull();
    expect(
      decodeSharedResult(encodeSharedResult({ ...RESULT, correct: 51 })),
    ).toBeNull();
    expect(
      decodeSharedResult(
        encodeSharedResult({ ...RESULT, finishReason: 'completed' }),
      ),
    ).toBeNull();
  });
});
