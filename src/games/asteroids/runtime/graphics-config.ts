import { COLORS, getColorRgb, withOpacity } from '../../../styles/colors';

export const graphicsConfig = {
  background: {
    centerColor: COLORS['space-07101f'],
    middleColor: COLORS['space-030712'],
    edgeColor: COLORS['space-010207'],
    gridColor: withOpacity(COLORS['ice-e1f5ff'], 0.05),
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
    color: COLORS['cyan-ship'],
    fillOpacity: 0.15,
    lineWidth: 2,
    shieldRgb: getColorRgb(COLORS['cyan-71f6ff']),
  },
  asteroids: {
    large: {
      color: COLORS['violet-deep'],
      fillOpacity: 0.1,
      lineWidth: 2,
    },
    medium: {
      color: COLORS['violet'],
      fillOpacity: 0.19,
      lineWidth: 2,
    },
    small: {
      color: COLORS['magenta-ff66cd'],
      fillOpacity: 0.16,
      lineWidth: 1.5,
    },
    detailColor: withOpacity(COLORS['blue-bda8ff'], 0.22),
  },
  pickups: {
    fillOpacity: 0.1,
    lineWidth: 2,
    shieldColor: COLORS['cyan-67faff'],
    triShotColor: COLORS['magenta-bright'],
    rapidFireColor: COLORS['amber'],
    overdriveColor: COLORS['yellow'],
    extraShipColor: COLORS['green'],
  },
  ufo: {
    bodyStrokeColor: COLORS['red-pink'],
    bodyFillColor: withOpacity(COLORS['magenta-ff2e76'], 0.2),
    canopyStrokeColor: COLORS['gold'],
    canopyFillColor: withOpacity(COLORS['orange-ffcd58'], 0.2),
    lightColor: getColorRgb(COLORS['gold-ffe05b']),
    healthTrackColor: withOpacity(COLORS['space-03050e'], 0.8),
    healthColor: COLORS['orange-ffcf55'],
  },
  projectiles: {
    playerColor: COLORS['cyan-a8ffff'],
    rapidTrailColor: COLORS['orange-ff6a16'],
    rapidCoreColor: COLORS['gold-ffe55f'],
    rapidTipColor: COLORS['gold-fffbd0'],
    hostileTrailColor: COLORS['red'],
    hostileTipColor: COLORS['gold-fff08a'],
  },
} as const;
