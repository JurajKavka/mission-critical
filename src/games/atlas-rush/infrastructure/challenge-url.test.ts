import { describe, expect, it } from 'vitest';
import { defaultSeed, shuffleTargetIds } from '../domain/shuffle';
import { regionTargets } from '../data/targets';
import {
  getChallengePath,
  isValidSeed,
  parseChallengeQuery,
  serializeChallengeQuery,
} from './challenge-url';

describe('challenge URL configuration', () => {
  it.each([1, 4, 6, 20])(
    'round trips a %i-letter Speed mode',
    (minimumCharacters) => {
      const config = {
        regionId: 'europe',
        level: 'beginner',
        learning: false,
        seed: defaultSeed,
        answerComparison: { mode: 'prefix', minimumCharacters },
      } as const;
      expect(serializeChallengeQuery(config)).toBe(`?speed=${minimumCharacters}`);
      expect(parseChallengeQuery('europe', `?speed=${minimumCharacters}`)).toEqual(
        {
          config,
          canonicalSearch: `?speed=${minimumCharacters}`,
          corrected: false,
        },
      );
    },
  );

  it.each([
    '?speed=',
    '?speed=0',
    '?speed=-1',
    '?speed=3.5',
    '?speed=NaN',
    '?speed=Infinity',
    '?speed=0x4',
    '?speed=%ZZ',
    '?speed=4&speed=4',
    '?speed=9007199254740992',
  ])('defaults invalid or ambiguous comparison settings: %s', (search) => {
    const parsed = parseChallengeQuery('africa', search);
    expect(parsed.config.answerComparison).toBeUndefined();
    expect(parsed.canonicalSearch).toBe('');
  });

  it('normalizes the specified invalid example without changing region', () => {
    const parsed = parseChallengeQuery(
      'africa',
      '?level=bad&learning=1&foo=bar',
    );
    expect(parsed.config).toEqual({
      regionId: 'africa',
      level: 'beginner',
      learning: true,
      seed: defaultSeed,
    });
    expect(parsed.canonicalSearch).toBe('?learning=1');
    expect(parsed.corrected).toBe(true);
  });

  it('round trips in stable key order while omitting defaults', () => {
    const config = {
      regionId: 'usa',
      level: 'expert',
      learning: true,
      seed: 'Example_9-A',
    } as const;
    expect(serializeChallengeQuery(config)).toBe(
      '?level=expert&learning=1&seed=Example_9-A',
    );
    expect(parseChallengeQuery('usa', serializeChallengeQuery(config))).toEqual(
      {
        config,
        canonicalSearch: '?level=expert&learning=1&seed=Example_9-A',
        corrected: false,
      },
    );
    expect(getChallengePath(config)).toBe(
      '/games/atlas-rush/usa/?level=expert&learning=1&seed=Example_9-A',
    );
    expect(
      serializeChallengeQuery({
        ...config,
        level: 'beginner',
        learning: false,
        seed: defaultSeed,
      }),
    ).toBe('');
  });

  it.each([
    '?level=expert&level=expert',
    '?level=expert&level=bad',
    '?level=%ZZ',
    '?level=%E0%A4%A',
  ])('defaults ambiguous or malformed levels: %s', (search) => {
    expect(parseChallengeQuery('europe', search).config.level).toBe('beginner');
  });

  it.each([
    '?seed=',
    '?seed=%ZZ',
    '?seed=%E0%A4%A',
    '?seed=a+b',
    '?seed=a%2Fb',
    '?seed=a&seed=a',
    `?seed=${'a'.repeat(65)}`,
  ])('defaults invalid or ambiguous seed: %s', (search) => {
    expect(parseChallengeQuery('africa', search).config.seed).toBe(defaultSeed);
  });

  it('removes unknown fields, invalid learning and noncanonical encodings', () => {
    expect(
      parseChallengeQuery('usa', '?region=europe&learning=2&x=y')
        .canonicalSearch,
    ).toBe('');
    expect(
      parseChallengeQuery('usa', '?learning=1&learning=1').config.learning,
    ).toBe(false);
    expect(
      parseChallengeQuery('usa', '?seed=%41&level=beginner').canonicalSearch,
    ).toBe('?seed=A');
    expect(
      parseChallengeQuery('usa', '?level=middle&learning=0').canonicalSearch,
    ).toBe('?level=middle');
  });

  it('uses the same stable seed and target order for missing and malformed seeds', () => {
    const absent = parseChallengeQuery('africa', '').config;
    const malformed = parseChallengeQuery('africa', '?seed=%').config;
    const ids = regionTargets.africa.map((target) => target.id);
    expect(shuffleTargetIds(ids, absent.seed)).toEqual(
      shuffleTargetIds(ids, malformed.seed),
    );
    expect(isValidSeed('A_-09')).toBe(true);
    expect(isValidSeed('é')).toBe(false);
  });
});
