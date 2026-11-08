import { describe, expect, it } from 'vitest';
import { regions as legacyRegions } from '../../../pages/games/atlas-rush/_game/regions';
import { regionMetadata } from './regions';
import { regionTargets } from './targets';

describe('geometry-free metadata', () => {
  it.each(legacyRegions)(
    'preserves ordered IDs and names for $name',
    (region) => {
      const targets = regionTargets[region.id];
      expect(targets).toEqual(
        region.countries.map(({ id, name }) => ({ id, name })),
      );
      expect(new Set(targets.map((target) => target.id)).size).toBe(
        targets.length,
      );
      expect(
        targets.every(
          (target) => Object.keys(target).sort().join() === 'id,name',
        ),
      ).toBe(true);
      expect(regionMetadata[region.id].targetName).toBe(region.targetName);
    },
  );

  it('retains all countries, states, marker locations and special European locations', () => {
    expect(
      Object.values(regionTargets).map((targets) => targets.length),
    ).toEqual([54, 12, 50, 47, 64]);
    expect(regionTargets.africa.map((target) => target.id)).toEqual(
      expect.arrayContaining(['CPV', 'COM', 'MUS', 'STP', 'SYC']),
    );
    expect(regionTargets.europe.map((target) => target.id)).toEqual(
      expect.arrayContaining([
        'AND',
        'LIE',
        'MLT',
        'MCO',
        'SMR',
        'VAT',
        'CYP',
        'KOS',
        'TUR',
        'RUS',
      ]),
    );
    expect(regionTargets.usa.map((target) => target.name)).toEqual(
      expect.arrayContaining(['Alaska', 'Hawaii']),
    );
  });
});
