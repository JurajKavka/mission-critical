import { getRoundSeconds as getDomainRoundSeconds } from '../../../../games/atlas-rush/domain/levels';
import type { Level, Region } from './types';

export { levels } from '../../../../games/atlas-rush/domain/levels';

export const getRoundSeconds = (region: Region, level: Level): number =>
  getDomainRoundSeconds(region.countries.length, level.id);
