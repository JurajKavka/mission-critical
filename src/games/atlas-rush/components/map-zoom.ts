export type MapBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type MapSize = Pick<MapBounds, 'width' | 'height'>;

const MIN_ZOOM_FRACTION = 0.25;
const MAX_ZOOM_FRACTION = 0.8;
const MAX_WHEEL_SCALE = 8;
const TARGET_PADDING = 2;

export const parseMapBounds = (viewBox: string): MapBounds => {
  const [x, y, width, height] = viewBox.split(' ').map(Number);
  return { x, y, width, height };
};

const clampMapBounds = (full: MapBounds, bounds: MapBounds): MapBounds => ({
  ...bounds,
  x: Math.max(full.x, Math.min(bounds.x, full.x + full.width - bounds.width)),
  y: Math.max(full.y, Math.min(bounds.y, full.y + full.height - bounds.height)),
});

const getMapViewportScale = (bounds: MapSize, viewport: MapSize) =>
  Math.min(viewport.width / bounds.width, viewport.height / bounds.height);

const centerMapBounds = (
  full: MapBounds,
  target: MapBounds,
  { width, height }: MapSize,
): MapBounds =>
  clampMapBounds(full, {
    x: target.x + (target.width - width) / 2,
    y: target.y + (target.height - height) / 2,
    width,
    height,
  });

export const getDetailMapBounds = (
  full: MapBounds,
  target: MapBounds,
  viewportAspect: number,
): MapBounds => {
  const maximumHeight = Math.min(
    full.height * MAX_ZOOM_FRACTION,
    (full.width * MAX_ZOOM_FRACTION) / viewportAspect,
  );
  const height = Math.min(
    maximumHeight,
    Math.max(
      full.height * MIN_ZOOM_FRACTION,
      (full.width * MIN_ZOOM_FRACTION) / viewportAspect,
      (target.width * TARGET_PADDING) / viewportAspect,
      target.height * TARGET_PADDING,
    ),
  );
  const width = height * viewportAspect;
  return centerMapBounds(full, target, { width, height });
};

export const getWheelMapBounds = (
  full: MapBounds,
  current: MapBounds,
  viewport: MapSize,
  target: MapBounds,
  factor: number,
): MapBounds => {
  const normalScale = getMapViewportScale(full, viewport);
  const currentScale = getMapViewportScale(current, viewport);
  const maximumScale = Math.max(normalScale * MAX_WHEEL_SCALE, currentScale);
  const nextScale = Math.min(currentScale * factor, maximumScale);
  if (nextScale <= normalScale * (1 + 1e-8)) {
    return full;
  }
  if (nextScale === currentScale) {
    return current;
  }

  const ratio = currentScale / nextScale;
  let width = Math.min(full.width, current.width * ratio);
  let height = Math.min(full.height, current.height * ratio);
  if (
    getMapViewportScale({ width, height }, viewport) >
    nextScale * (1 + 1e-8)
  ) {
    // As a target view expands past an edge, grow along the axis that fits
    // the full map so the on-screen scale can keep decreasing.
    if (viewport.width / full.width <= viewport.height / full.height) {
      width = Math.min(full.width, viewport.width / nextScale);
    } else {
      height = Math.min(full.height, viewport.height / nextScale);
    }
  }

  return centerMapBounds(full, target, { width, height });
};
