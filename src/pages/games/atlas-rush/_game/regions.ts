import { africaCountries } from './africa';
import { southAmericaCountries } from './south-america';
import { usaStates } from './usa';
import type { Region } from './types';

export const africa: Region = {
  id: 'africa',
  name: 'Africa',
  targetName: 'country',
  code: 'AFR',
  hasIslandMarkers: true,
  viewBox: '0 0 86 78',
  countries: africaCountries,
};

export const southAmerica: Region = {
  id: 'south-america',
  name: 'South America',
  targetName: 'country',
  code: 'SAM',
  hasIslandMarkers: false,
  viewBox: '0 0 52 73',
  countries: southAmericaCountries,
};

export const usa: Region = {
  id: 'usa',
  name: 'USA',
  targetName: 'state',
  code: 'USA',
  hasIslandMarkers: false,
  viewBox: '0 0 50 38',
  countries: usaStates,
};

export const regions: readonly Region[] = [africa, southAmerica, usa];
