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

export type GlobeZoom = { mode: 'target' } | { mode: 'wheel'; scale: number };

const GRATICULE = geoGraticule10();
const GLOBE_RADIUS = 222;
const GLOBE_TARGET_SCALE = 2.2;
const MAX_WHEEL_SCALE = 8;
const GLOBE_SIZE = 500;
const GLOBE_MIDPOINT = GLOBE_SIZE / 2;

export const getGlobeWheelScale = (
  zoom: GlobeZoom | null,
  aspectRatio: number,
  factor: number,
) => {
  const targetScale = GLOBE_TARGET_SCALE / Math.min(1, aspectRatio);
  let currentScale = 1;
  if (zoom?.mode === 'target') {
    currentScale = targetScale;
  } else if (zoom?.mode === 'wheel') {
    currentScale = zoom.scale;
  }

  const scale = Math.min(
    currentScale * factor,
    Math.max(MAX_WHEEL_SCALE, targetScale, currentScale),
  );
  return scale <= 1 + 1e-8 ? 1 : scale;
};

export const getGlobeView = (aspectRatio: number, zoom: GlobeZoom | null) => {
  let width = GLOBE_SIZE;
  let height = GLOBE_SIZE;
  let scale = 1;
  if (zoom?.mode === 'target') {
    width *= aspectRatio;
    scale = GLOBE_TARGET_SCALE;
  } else if (zoom?.mode === 'wheel') {
    // Fill the viewport while keeping the same units per pixel as the normal
    // square view. The wheel scale can then multiply the normal radius.
    height /= Math.min(1, aspectRatio);
    width = height * aspectRatio;
    scale = zoom.scale;
  }
  return {
    x: (GLOBE_SIZE - width) / 2,
    y: (GLOBE_SIZE - height) / 2,
    width,
    height,
    radius: GLOBE_RADIUS * scale,
  };
};

export const getGlobeGeometry = (
  geography: WorldGeography,
  center: GlobeCenter,
  radius: number,
  target: WorldCountry | undefined,
  isMoving: boolean,
): GlobeGeometry => {
  const projection = geoOrthographic()
    .translate([GLOBE_MIDPOINT, GLOBE_MIDPOINT])
    .scale(radius)
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
