import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import { matchesTarget, normalizeAnswer } from './answers';

const aliasCases: readonly (readonly [string, readonly string[]])[] = [
  ['COG', ['Congo', 'Congo Brazzaville', 'Republic of Congo']],
  [
    'COD',
    ['DR Congo', 'DRC', 'Congo Kinshasa', 'Democratic Republic of Congo'],
  ],
  ['CIV', ['Côte d’Ivoire', 'Cote dIvoire', 'Ivory Coast']],
  ['SWZ', ['Eswatini', 'Swaziland']],
  ['TZA', ['Tanzania']],
  ['CPV', ['Cape Verde']],
  ['STP', ['Sao Tome', 'Sao Tome and Principe']],
  ['GMB', ['The Gambia']],
  ['GNB', ['Guinea-Bissau']],
  ['CZE', ['Czech Republic']],
  ['GBR', ['UK', 'Great Britain', 'Britain']],
  ['MKD', ['Macedonia']],
  ['TUR', ['Türkiye']],
  ['VAT', ['Vatican', 'Holy See']],
];

describe('answer matching', () => {
  it.each(aliasCases)(
    'accepts every legacy alias for %s',
    (targetId, aliases) => {
      const target = Object.values(regionTargets)
        .flat()
        .find((candidate) => candidate.id === targetId);
      expect(target).toBeDefined();
      if (!target) {
        throw new Error(`Missing target ${targetId}`);
      }
      for (const alias of aliases) {
        expect(matchesTarget(target, alias)).toBe(true);
      }
    },
  );

  it.each(Object.entries(regionTargets))(
    'accepts every canonical name in %s',
    (_regionId, targets) => {
      for (const target of targets) {
        expect(matchesTarget(target, target.name)).toBe(true);
        expect(matchesTarget(target, `  ${target.name.toUpperCase()}!  `)).toBe(
          true,
        );
      }
    },
  );

  it.each([
    ['  Côte d’Ivoire!  ', 'cotedivoire'],
    ['Sa\u0303o Tome\u0301 & Pri\u0301ncipe', 'saotomeprincipe'],
    ['Guinea - Bissau', 'guineabissau'],
    ['TÜRKIYE', 'turkiye'],
    ['\tNew\nYork\r', 'newyork'],
    ['A😀B\u0000C-123', 'abc123'],
    ['Łódź', 'odz'],
    ['', ''],
    ['\u0301!?😀中文', ''],
  ])('normalizes %j without fuzzy transliteration', (answer, expected) => {
    expect(normalizeAnswer(answer)).toBe(expected);
  });

  it.each([
    '',
    '   ',
    '!!!',
    '😀',
    '中国',
    '123',
    'Algerias',
    'Algeria1',
    'a'.repeat(10000),
  ])('rejects unusual or incorrect input %j', (answer) => {
    expect(matchesTarget({ id: 'DZA', name: 'Algeria' }, answer)).toBe(false);
  });

  it('matches only the target, without postal abbreviations or country-code shortcuts', () => {
    expect(
      matchesTarget(
        { id: 'COD', name: 'Democratic Republic of the Congo' },
        'Congo',
      ),
    ).toBe(false);
    expect(
      matchesTarget({ id: 'COG', name: 'Republic of the Congo' }, 'DRC'),
    ).toBe(false);
    expect(matchesTarget({ id: 'DZA', name: 'Algeria' }, 'DZA')).toBe(false);
    expect(matchesTarget({ id: 'US06', name: 'California' }, 'CA')).toBe(false);
  });
});
