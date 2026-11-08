import type { RegionId } from '../domain/types';
import type { Country } from '../../../pages/games/atlas-rush/_game/types';

export type Geography = {
  readonly viewBox: string;
  readonly countries: readonly Country[];
};

export const loadGeography = async (regionId: RegionId): Promise<Geography> => {
  if (regionId === 'asia') {
    const { asiaCountries } =
      await import('../../../pages/games/atlas-rush/_game/asia');
    return { viewBox: '0 0 120 128', countries: asiaCountries };
  } else if (regionId === 'africa') {
    const { africaCountries } =
      await import('../../../pages/games/atlas-rush/_game/africa');
    return { viewBox: '0 0 86 78', countries: africaCountries };
  } else if (regionId === 'south-america') {
    const { southAmericaCountries } =
      await import('../../../pages/games/atlas-rush/_game/south-america');
    return { viewBox: '0 0 52 73', countries: southAmericaCountries };
  } else if (regionId === 'usa') {
    const { usaStates } =
      await import('../../../pages/games/atlas-rush/_game/usa');
    return { viewBox: '0 0 50 38', countries: usaStates };
  }
  const { europeCountries } =
    await import('../../../pages/games/atlas-rush/_game/europe');
  return { viewBox: '0 0 62 41', countries: europeCountries };
};
