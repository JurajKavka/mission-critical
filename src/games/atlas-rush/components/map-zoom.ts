type MapBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

const MIN_ZOOM_FRACTION = 0.25;
const MAX_ZOOM_FRACTION = 0.8;
const TARGET_PADDING = 2;

export const getDetailViewBox = (
  viewBox: string,
  target: MapBounds,
  viewportAspect: number,
): string => {
  const [mapX, mapY, mapWidth, mapHeight] = viewBox.split(' ').map(Number);
  const maximumHeight = Math.min(
    mapHeight * MAX_ZOOM_FRACTION,
    (mapWidth * MAX_ZOOM_FRACTION) / viewportAspect,
  );
  const height = Math.min(
    maximumHeight,
    Math.max(
      mapHeight * MIN_ZOOM_FRACTION,
      (mapWidth * MIN_ZOOM_FRACTION) / viewportAspect,
      (target.width * TARGET_PADDING) / viewportAspect,
      target.height * TARGET_PADDING,
    ),
  );
  const width = height * viewportAspect;
  const x = Math.max(
    mapX,
    Math.min(target.x + target.width / 2 - width / 2, mapX + mapWidth - width),
  );
  const y = Math.max(
    mapY,
    Math.min(
      target.y + target.height / 2 - height / 2,
      mapY + mapHeight - height,
    ),
  );
  return `${x} ${y} ${width} ${height}`;
};
