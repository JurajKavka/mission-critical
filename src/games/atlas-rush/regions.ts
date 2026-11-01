import { africaCountries } from './africa';
import type { Region } from './types';

export const africa: Region = {
  name: 'Africa',
  viewBox: '0 0 86 78',
  countries: africaCountries,
};

// Change this value to adjust the length of a round.
export const ROUND_SECONDS = 300;
