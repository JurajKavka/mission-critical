import { geoArea, geoCentroid } from 'd3-geo';
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Position,
} from 'geojson';

export type WorldCountry = Feature<MultiPolygon, { name: string }>;
export type WorldGeography = FeatureCollection<MultiPolygon, { name: string }>;
export type GlobeCenter = [longitude: number, latitude: number];

const orientPolygon = (polygon: Position[][]): Position[][] => {
  if (geoArea({ type: 'Polygon', coordinates: polygon }) > 2 * Math.PI) {
    return polygon.map((ring) => [...ring].reverse());
  }
  return polygon;
};

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
  const geography: WorldGeography = await response.json();
  return {
    ...geography,
    features: geography.features.map((country) => ({
      ...country,
      geometry: {
        ...country.geometry,
        coordinates: country.geometry.coordinates.map(orientPolygon),
      },
    })),
  };
};
