import type { Position } from 'geojson';
import type { WorldGeography } from '../infrastructure/world-geography';

const SIMPLIFICATION_TOLERANCE_SQUARED = 0.3 ** 2;

const getSegmentDistanceSquared = (
  point: Position,
  start: Position,
  end: Position,
): number => {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const fraction = lengthSquared
    ? Math.max(
        0,
        Math.min(
          1,
          ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
            lengthSquared,
        ),
      )
    : 0;
  return (
    (point[0] - start[0] - fraction * dx) ** 2 +
    (point[1] - start[1] - fraction * dy) ** 2
  );
};

const simplifyLine = (positions: Position[]): Position[] => {
  if (positions.length <= 2) {
    return positions;
  }
  const start = positions[0];
  const end = positions[positions.length - 1];
  const furthest = positions.slice(1, -1).reduce(
    (result, point, index) => {
      const distance = getSegmentDistanceSquared(point, start, end);
      return distance > result.distance
        ? { distance, index: index + 1 }
        : result;
    },
    { distance: SIMPLIFICATION_TOLERANCE_SQUARED, index: 0 },
  );
  if (furthest.index === 0) {
    return [start, end];
  }
  return [
    ...simplifyLine(positions.slice(0, furthest.index + 1)).slice(0, -1),
    ...simplifyLine(positions.slice(furthest.index)),
  ];
};

const getRingOrientation = (ring: Position[]): number =>
  ring.slice(1).reduce((area, point, index) => {
    const previous = ring[index];
    return area + previous[0] * point[1] - point[0] * previous[1];
  }, 0);

const simplifyRing = (ring: Position[]): Position[] => {
  // Preserve rings crossing the antimeridian, where planar distances are misleading.
  if (
    ring.some(
      (point, index) =>
        index > 0 && Math.abs(point[0] - ring[index - 1][0]) > 180,
    )
  ) {
    return ring;
  }
  const simplified = simplifyLine(ring);
  if (
    simplified.length < 4 ||
    Math.sign(getRingOrientation(simplified)) !==
      Math.sign(getRingOrientation(ring))
  ) {
    return ring;
  }
  return simplified;
};

export const simplifyGlobeGeography = (
  geography: WorldGeography,
): WorldGeography => ({
  ...geography,
  features: geography.features.map((country) => ({
    ...country,
    geometry: {
      ...country.geometry,
      coordinates: country.geometry.coordinates.map((polygon) =>
        polygon.map(simplifyRing),
      ),
    },
  })),
});
