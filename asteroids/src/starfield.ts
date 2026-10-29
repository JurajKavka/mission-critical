import { TAU } from './constants';
import { graphicsConfig } from './graphics-config';
import type { Star } from './types';

interface GalaxyStar {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

const GALAXY_ANGLE = -Math.PI / 5;

const getGaussianOffset = (): number => {
  const firstRandomValue = Math.max(Math.random(), Number.EPSILON);
  const secondRandomValue = Math.random();

  return (
    Math.sqrt(-2 * Math.log(firstRandomValue)) *
    Math.cos(TAU * secondRandomValue)
  );
};

const getGalaxyCenterY = (
  horizontalProgress: number,
  width: number,
  height: number,
): number => {
  const distanceFromCenter = (horizontalProgress - 0.5) * width;
  return height * 0.5 + Math.tan(GALAXY_ANGLE) * distanceFromCenter;
};

const getCentralBulgeStrength = (horizontalProgress: number): number => {
  const distanceFromCenter = (horizontalProgress - 0.52) / 0.2;
  return Math.exp(-(distanceFromCenter * distanceFromCenter));
};

const getGalaxyStarSize = (centralBulgeStrength: number): number => {
  if (Math.random() < 0.055 + centralBulgeStrength * 0.045) {
    return 1.25 + Math.random() * 0.8;
  } else {
    return 0.3 + Math.random();
  }
};

const getBandSpread = (
  height: number,
  centralBulgeStrength: number,
  isHaloStar: boolean,
): number => {
  if (isHaloStar) {
    return height * (0.12 + centralBulgeStrength * 0.035);
  } else {
    return height * (0.032 + centralBulgeStrength * 0.035);
  }
};

const getBaseGalaxyStarAlpha = (isHaloStar: boolean): number => {
  if (isHaloStar) {
    return 0.03 + Math.random() * 0.095;
  } else {
    return 0.14 + Math.random() * 0.27;
  }
};

const getGalaxyStarAlpha = (
  verticalOffset: number,
  bandSpread: number,
  centralBulgeStrength: number,
  isHaloStar: boolean,
): number => {
  const distanceFromCore = Math.abs(verticalOffset) / bandSpread;
  const coreStrength = Math.max(0.2, 1 - distanceFromCore * 0.22);
  const longitudinalStrength = 0.58 + centralBulgeStrength * 0.65;
  return (
    getBaseGalaxyStarAlpha(isHaloStar) * coreStrength * longitudinalStrength
  );
};

export const createBackgroundStars = (
  width: number,
  height: number,
): Star[] => {
  const starCount = Math.floor((width * height) / 7000);

  return Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.25,
    phase: Math.random() * TAU,
    layer: 0.3 + Math.random() * 0.7,
  }));
};

const createGalaxyStars = (width: number, height: number): GalaxyStar[] => {
  const galaxyStars: GalaxyStar[] = [];
  const starCount = Math.min(3600, Math.floor((width * height) / 1000));

  while (galaxyStars.length < starCount) {
    const horizontalProgress = Math.random();
    const x = horizontalProgress * width;
    const centralBulgeStrength = getCentralBulgeStrength(horizontalProgress);
    const isHaloStar = Math.random() < 0.3;
    const bandSpread = getBandSpread(height, centralBulgeStrength, isHaloStar);
    const verticalOffset = getGaussianOffset() * bandSpread;
    const y =
      getGalaxyCenterY(horizontalProgress, width, height) + verticalOffset;

    if (y >= 0 && y <= height) {
      galaxyStars.push({
        x,
        y,
        size: getGalaxyStarSize(centralBulgeStrength),
        alpha: getGalaxyStarAlpha(
          verticalOffset,
          bandSpread,
          centralBulgeStrength,
          isHaloStar,
        ),
      });
    }
  }

  return galaxyStars;
};

const drawGalaxyHaze = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  const bandLength = Math.hypot(width, height) * 1.2;
  const bandThickness = height * 0.2;

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(GALAXY_ANGLE);

  const haze = context.createLinearGradient(
    0,
    -bandThickness,
    0,
    bandThickness,
  );
  haze.addColorStop(0, 'rgba(228, 240, 255, 0)');
  haze.addColorStop(0.28, 'rgba(228, 240, 255, 0.014)');
  haze.addColorStop(0.43, 'rgba(238, 246, 255, 0.055)');
  haze.addColorStop(0.49, 'rgba(250, 252, 255, 0.13)');
  haze.addColorStop(0.51, 'rgba(250, 252, 255, 0.13)');
  haze.addColorStop(0.57, 'rgba(238, 246, 255, 0.055)');
  haze.addColorStop(0.72, 'rgba(228, 240, 255, 0.014)');
  haze.addColorStop(1, 'rgba(228, 240, 255, 0)');

  context.fillStyle = haze;
  context.fillRect(
    -bandLength,
    -bandThickness,
    bandLength * 2,
    bandThickness * 2,
  );
  context.restore();

  const centralBulgeX = width * 0.52;
  const centralBulgeY = getGalaxyCenterY(0.52, width, height);
  const bulgeRadius = Math.min(width, height) * 0.3;
  context.save();
  context.translate(centralBulgeX, centralBulgeY);
  context.rotate(GALAXY_ANGLE);
  context.scale(1, 0.34);
  const bulge = context.createRadialGradient(0, 0, 0, 0, 0, bulgeRadius);
  bulge.addColorStop(
    0,
    `rgba(255, 255, 255, ${graphicsConfig.galaxy.coreOpacity})`,
  );
  bulge.addColorStop(
    0.2,
    `rgba(250, 252, 255, ${graphicsConfig.galaxy.innerOpacity})`,
  );
  bulge.addColorStop(
    0.48,
    `rgba(240, 247, 255, ${graphicsConfig.galaxy.outerOpacity})`,
  );
  bulge.addColorStop(1, 'rgba(228, 240, 255, 0)');
  context.fillStyle = bulge;
  context.beginPath();
  context.arc(0, 0, bulgeRadius, 0, TAU);
  context.fill();
  context.restore();
};

const drawGalaxyDustLane = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  const bandLength = Math.hypot(width, height) * 1.2;
  const laneHalfWidth = Math.max(3, height * 0.008);

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(GALAXY_ANGLE);
  const dustLane = context.createLinearGradient(
    0,
    -laneHalfWidth,
    0,
    laneHalfWidth,
  );
  dustLane.addColorStop(0, 'rgba(1, 3, 9, 0)');
  dustLane.addColorStop(0.5, 'rgba(1, 3, 9, 0.15)');
  dustLane.addColorStop(1, 'rgba(1, 3, 9, 0)');
  context.fillStyle = dustLane;
  context.fillRect(
    -bandLength,
    -laneHalfWidth,
    bandLength * 2,
    laneHalfWidth * 2,
  );
  context.restore();
};

export const renderGalaxyTexture = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): void => {
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('This browser does not support the 2D canvas API.');
  }

  drawGalaxyHaze(context, width, height);

  for (const star of createGalaxyStars(width, height)) {
    context.fillStyle = `rgba(242, 247, 255, ${star.alpha})`;
    context.fillRect(star.x, star.y, star.size, star.size);
  }

  drawGalaxyDustLane(context, width, height);
};
