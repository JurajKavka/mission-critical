import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import type {
  GlobeCenter,
  WorldCountry,
  WorldGeography,
} from '../infrastructure/world-geography';

type GlobeCountryGeometry = {
  id: string;
  path: string;
};

type GlobeGeometry = {
  ocean: string;
  grid: string;
  countries: readonly GlobeCountryGeometry[];
  targetArea: number | null;
  projectMarker: (location: GlobeCenter) => [number, number] | null;
};

const GRATICULE = geoGraticule10();
export const GLOBE_RADIUS = 222;
export const GLOBE_ZOOM_SCALE = 2.2;
const GLOBE_MIDPOINT = 250;

export const getGlobeGeometry = (
  geography: WorldGeography,
  center: GlobeCenter,
  isZoomed: boolean,
  target: WorldCountry | undefined,
  isMoving: boolean,
): GlobeGeometry => {
  const projection = geoOrthographic()
    .translate([GLOBE_MIDPOINT, GLOBE_MIDPOINT])
    .scale(GLOBE_RADIUS * (isZoomed ? GLOBE_ZOOM_SCALE : 1))
    .rotate([-center[0], -center[1]])
    .clipAngle(90)
    .precision(isMoving ? 1.5 : 0.4);
  const path = geoPath(projection);
  return {
    ocean: path({ type: 'Sphere' }) ?? '',
    grid: path(GRATICULE) ?? '',
    countries: geography.features.map((country) => ({
      id: String(country.id),
      path: path(target && country.id === target.id ? target : country) ?? '',
    })),
    targetArea: target ? path.area(target) : null,
    projectMarker: (location: GlobeCenter) => {
      if (geoDistance(center, location) >= Math.PI / 2) {
        return null;
      }
      return projection(location);
    },
  };
};
