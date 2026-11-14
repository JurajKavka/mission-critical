import type { RegionId } from '../domain/types';

export type RegionMetadata = {
  readonly id: RegionId;
  readonly code: string;
  readonly name: string;
  readonly targetName: 'country' | 'state';
  readonly hasIslandMarkers: boolean;
  readonly markerNote?: string;
};

export const regionMetadata: Readonly<Record<RegionId, RegionMetadata>> = {
  world: {
    id: 'world',
    name: 'Whole world',
    targetName: 'country',
    code: 'WRL',
    hasIslandMarkers: true,
    markerNote:
      'Globe rotates to each target · Small countries shown as markers',
  },
  africa: {
    id: 'africa',
    name: 'Africa',
    targetName: 'country',
    code: 'AFR',
    hasIslandMarkers: true,
    markerNote: 'Island nations shown as markers',
  },
  'south-america': {
    id: 'south-america',
    name: 'South America',
    targetName: 'country',
    code: 'SAM',
    hasIslandMarkers: false,
  },
  usa: {
    id: 'usa',
    name: 'USA',
    targetName: 'state',
    code: 'USA',
    hasIslandMarkers: false,
  },
  europe: {
    id: 'europe',
    name: 'Europe',
    targetName: 'country',
    code: 'EUR',
    hasIslandMarkers: true,
    markerNote: 'Small countries shown as markers',
  },
  asia: {
    id: 'asia',
    name: 'Asia',
    targetName: 'country',
    code: 'ASI',
    hasIslandMarkers: true,
    markerNote: 'Small countries shown as markers',
  },
};
