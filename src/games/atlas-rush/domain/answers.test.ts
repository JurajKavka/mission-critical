import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import {
  getMatchedTargetName,
  matchesTarget,
  normalizeAnswer,
} from './answers';

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
  ['TLS', ['East Timor']],
  ['PSE', ['State of Palestine']],
  ['KOR', ['Republic of Korea']],
  ['PRK', ['DPRK', 'Democratic People’s Republic of Korea']],
  ['ARE', ['UAE']],
  ['FSM', ['Federated States of Micronesia']],
];

describe('answer matching', () => {
  it('returns the matching variation and prefers full aliases over longer prefixes', () => {
    const comparison = { mode: 'prefix', minimumCharacters: 4 } as const;
    const target = { id: 'TZA', name: 'United Republic of Tanzania' };
    expect(getMatchedTargetName(target, 'Tanz', comparison)).toBe('Tanzania');
    expect(getMatchedTargetName(target, 'Unit', comparison)).toBe(target.name);
    expect(getMatchedTargetName(target, 'Wrong', comparison)).toBeNull();
    expect(
      getMatchedTargetName(
        { id: 'STP', name: 'São Tomé and Príncipe' },
        'Sao Tome',
        comparison,
      ),
    ).toBe('Sao Tome');
  });

  it.each(aliasCases)(
    'matches the prefix of every accepted variation for %s',
    (targetId, aliases) => {
      const target = Object.values(regionTargets)
        .flat()
        .find((candidate) => candidate.id === targetId);
      if (!target) {
        throw new Error(`Missing target ${targetId}`);
      }
      aliases.forEach((alias) => {
        expect(
          matchesTarget(target, normalizeAnswer(alias).slice(0, 4), {
            mode: 'prefix',
            minimumCharacters: 4,
          }),
        ).toBe(true);
      });
    },
  );

  it.each(Object.entries(regionTargets))(
    'matches canonical prefixes in %s, including shorter full names',
    (_regionId, targets) => {
      targets.forEach((target) => {
        expect(
          matchesTarget(target, normalizeAnswer(target.name).slice(0, 4), {
            mode: 'prefix',
            minimumCharacters: 4,
          }),
        ).toBe(true);
      });
    },
  );

  it('requires the configured normalized prefix and rejects incorrect suffixes', () => {
    const target = { id: 'ZAF', name: 'South Africa' };
    const comparison = { mode: 'prefix', minimumCharacters: 6 } as const;
    expect(matchesTarget(target, 'South', comparison)).toBe(false);
    expect(matchesTarget(target, 'SÓUTH-A', comparison)).toBe(true);
    expect(matchesTarget(target, 'South Af', comparison)).toBe(true);
    expect(matchesTarget(target, 'South Ax', comparison)).toBe(false);
    expect(matchesTarget(target, 'South Africa extra', comparison)).toBe(false);
    expect(matchesTarget(target, '  -- ', comparison)).toBe(false);
    expect(matchesTarget(target, 'South A', { mode: 'full' })).toBe(false);
    expect(
      matchesTarget(target, 'South Africa', {
        mode: 'prefix',
        minimumCharacters: 20,
      }),
    ).toBe(true);
  });

  it('accepts short aliases in full without accepting incomplete short prefixes', () => {
    const comparison = { mode: 'prefix', minimumCharacters: 4 } as const;
    const target = { id: 'GBR', name: 'United Kingdom' };
    expect(matchesTarget(target, 'UK', comparison)).toBe(true);
    expect(matchesTarget(target, 'U', comparison)).toBe(false);
    expect(matchesTarget(target, 'Uni', comparison)).toBe(false);
    expect(matchesTarget(target, 'Grea', comparison)).toBe(true);
    expect(matchesTarget(target, 'Brit', comparison)).toBe(true);
  });

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
