import { regionMetadata } from '../../../../games/atlas-rush/data/regions';
import { africaCountries } from './africa';
import { asiaCountries } from './asia';
import { europeCountries } from './europe';
import { southAmericaCountries } from './south-america';
import { usaStates } from './usa';
import type { Region } from './types';

export const africa: Region = {
  ...regionMetadata['africa'],
  viewBox: '0 0 86 78',
  countries: africaCountries,
};

export const southAmerica: Region = {
  ...regionMetadata['south-america'],
  viewBox: '0 0 52 73',
  countries: southAmericaCountries,
};

export const usa: Region = {
  ...regionMetadata['usa'],
  viewBox: '0 0 50 38',
  countries: usaStates,
};

export const europe: Region = {
  ...regionMetadata['europe'],
  viewBox: '0 0 62 41',
  countries: europeCountries,
};

export const asia: Region = {
  ...regionMetadata.asia,
  viewBox: '0 0 120 128',
  countries: asiaCountries,
};

export const regions: readonly Region[] = [
  africa,
  southAmerica,
  usa,
  europe,
  asia,
];
