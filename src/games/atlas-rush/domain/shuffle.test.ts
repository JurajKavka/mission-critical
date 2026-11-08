import { describe, expect, it } from 'vitest';
import { regionTargets } from '../data/targets';
import { challengeVersion, defaultSeed, shuffleTargetIds } from './shuffle';
import { regionIds } from './test-fixtures';
import type { RegionId } from './types';

// Full v1 permutations, independently calculated with unsigned 32-bit arithmetic.
const goldenOrders: Readonly<Record<RegionId, string>> = {
  africa:
    'GNQ GMB AGO KEN DJI MAR GAB MLI LBR EGY NER BDI LBY COD MRT SDN SLE BFA DZA CMR ZMB COM BEN SOM CPV MDG RWA ERI BWA ZAF NGA GIN SSD GNB SWZ MWI CAF TCD UGA CIV LSO TUN MOZ TZA COG TGO SYC NAM ETH SEN MUS GHA ZWE STP',
  'south-america': 'PRY ECU ARG PER BOL COL BRA GUY SUR CHL URY VEN',
  usa: 'US22 US41 US49 US51 US33 US40 US44 US17 US08 US16 US32 US25 US36 US05 US01 US06 US02 US48 US31 US13 US38 US28 US37 US18 US04 US26 US29 US53 US42 US54 US19 US30 US09 US10 US56 US15 US27 US46 US34 US45 US12 US47 US21 US35 US20 US39 US23 US24 US50 US55',
  europe:
    'LUX BIH MKD MNE LIE ESP SVN RUS KOS EST GBR ALB BEL UKR DEU AUT NLD ROU SVK PRT FIN BLR ITA LTU ISL CYP MLT FRA MDA BGR HRV SMR DNK LVA CHE NOR SWE CZE TUR HUN POL GRC SRB MCO IRL AND VAT',
  asia: 'KOR MYS IRQ TWN ISR UZB LKA LBN RUS JOR SYR ARM PLW SGP NZL PHL AUS KGZ ARE TJK PRK MMR IND JPN BGD NPL BRN BTN AFG CHN PSE FSM AZE IRN QAT TUR SLB WSM BHR NRU PAK MDV GEO MHL TUV OMN KHM CYP KWT IDN MNG TON YEM THA FJI TLS KIR PNG KAZ SAU VUT LAO TKM VNM',
};

describe('version 1 seeded ordering', () => {
  it.each(regionIds)(
    'locks the complete default-seed permutation for %s',
    (regionId) => {
      const ids = Object.freeze(
        regionTargets[regionId].map((target) => target.id),
      );
      const original = [...ids];
      const shuffled = shuffleTargetIds(ids, defaultSeed);
      expect(challengeVersion).toBe(1);
      expect(shuffled).toEqual(goldenOrders[regionId].split(' '));
      expect(shuffleTargetIds(ids, defaultSeed)).toEqual(shuffled);
      expect([...shuffled].sort()).toEqual([...ids].sort());
      expect(ids).toEqual(original);
      expect(shuffled).not.toBe(ids);
      expect(shuffleTargetIds(ids, 'another-seed')).not.toEqual(shuffled);
      expect(shuffleTargetIds(ids, 'CaseSensitive')).not.toEqual(
        shuffleTargetIds(ids, 'casesensitive'),
      );
    },
  );

  it('handles empty and single-target lists without mutation', () => {
    expect(shuffleTargetIds(Object.freeze([]), defaultSeed)).toEqual([]);
    expect(shuffleTargetIds(Object.freeze(['VAT']), defaultSeed)).toEqual([
      'VAT',
    ]);
  });

  it('has no shared PRNG state across interleaved regions/seeds', () => {
    const ids = regionTargets.europe.map((target) => target.id);
    const first = shuffleTargetIds(ids, 'A_19-test');
    shuffleTargetIds(
      regionTargets.usa.map((target) => target.id),
      'other',
    );
    shuffleTargetIds(ids, 'z'.repeat(64));
    expect(shuffleTargetIds(ids, 'A_19-test')).toEqual(first);
  });
});
