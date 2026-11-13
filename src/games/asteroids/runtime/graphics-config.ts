import { COLORS, getColorRgb, withOpacity } from '../../../styles/colors';

export const graphicsConfig = {
  background: {
    centerColor: COLORS['nebula-blue'],
    middleColor: COLORS['space-blue'],
    edgeColor: COLORS['void'],
    gridColor: withOpacity(COLORS['primary-text'], 0.05),
    starOpacityScale: 1.5,
  },
  galaxy: {
    angleDegrees: 0,
    edgeMarginRatio: 0.005,
    edgeFadeRatio: 0.05,
    coreOpacity: 0.07,
    innerOpacity: 0.07,
    outerOpacity: 0.07,
    hazeEdgeOpacity: 0.0,
    hazeShoulderOpacity: 0.0,
    haloStarOpacityScale: 0,
    armOpacityScale: 0.6,
  },
  ship: {
    color: COLORS['cyan'],
    fillOpacity: 0.15,
    lineWidth: 2,
    shieldRgb: getColorRgb(COLORS['cyan']),
  },
  asteroids: {
    large: {
      color: COLORS['violet'],
      fillOpacity: 0.1,
      lineWidth: 2,
    },
    medium: {
      color: COLORS['violet'],
      fillOpacity: 0.19,
      lineWidth: 2,
    },
    small: {
      color: COLORS['magenta'],
      fillOpacity: 0.16,
      lineWidth: 1.5,
    },
    detailColor: withOpacity(COLORS['violet'], 0.22),
  },
  pickups: {
    fillOpacity: 0.1,
    lineWidth: 2,
    shieldColor: COLORS['cyan'],
    triShotColor: COLORS['magenta'],
    rapidFireColor: COLORS['amber'],
    overdriveColor: COLORS['amber'],
    extraShipColor: COLORS['green'],
  },
  ufo: {
    bodyStrokeColor: COLORS['magenta'],
    bodyFillColor: withOpacity(COLORS['magenta'], 0.2),
    canopyStrokeColor: COLORS['amber'],
    canopyFillColor: withOpacity(COLORS['amber'], 0.2),
    lightColor: getColorRgb(COLORS['amber']),
    healthTrackColor: withOpacity(COLORS['space-blue'], 0.8),
    healthColor: COLORS['amber'],
  },
  projectiles: {
    playerColor: COLORS['cyan'],
    rapidTrailColor: COLORS['amber'],
    rapidTipColor: COLORS['primary-text'],
    hostileTrailColor: COLORS['red'],
    hostileTipColor: COLORS['primary-text'],
  },
} as const;
