import { africaCountries } from './africa';
import { southAmericaCountries } from './south-america';
import type { Region } from './types';

export const africa: Region = {
  id: 'africa',
  name: 'Africa',
  code: 'AFR',
  hasIslandMarkers: true,
  viewBox: '0 0 86 78',
  countries: africaCountries,
};

export const southAmerica: Region = {
  id: 'south-america',
  name: 'South America',
  code: 'SAM',
  hasIslandMarkers: false,
  viewBox: '0 0 52 73',
  countries: southAmericaCountries,
};

export const regions: readonly Region[] = [africa, southAmerica];
