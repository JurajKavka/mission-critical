import { geoArea, geoCentroid } from 'd3-geo';
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

export type WorldCountry = Feature<MultiPolygon, { name: string }>;
export type WorldGeography = FeatureCollection<MultiPolygon, { name: string }>;
export type GlobeCenter = [longitude: number, latitude: number];

// Focus the largest landmass rather than averaging distant overseas territories.
export const getCountryCenter = (country: WorldCountry): GlobeCenter => {
  const mainland = country.geometry.coordinates.reduce(
    (largest, polygon) => {
      const area = geoArea({ type: 'Polygon', coordinates: polygon });
      if (area > largest.area) {
        return { area, coordinates: polygon };
      }
      return largest;
    },
    { area: -1, coordinates: country.geometry.coordinates[0] },
  );
  return geoCentroid({ type: 'Polygon', coordinates: mainland.coordinates });
};

export const loadWorldGeography = async (
  signal: AbortSignal,
): Promise<WorldGeography> => {
  const response = await fetch('/games/atlas-rush/world.geo.json', { signal });
  if (!response.ok) {
    throw new Error('World geography could not be loaded.');
  }
  return response.json();
};
