export const graphicsConfig = {
  background: {
    centerColor: '#0b1830',
    middleColor: '#050b19',
    edgeColor: '#010309',
    gridColor: 'rgba(225, 245, 255, 0.12)',
  },
  galaxy: {
    coreOpacity: 0.05,
    innerOpacity: 0.05,
    outerOpacity: 0.05,
  },
  ship: {
    color: '#86fcff',
    backgroundColor: '#172c32',
    lineWidth: 2,
    shieldRgb: '113, 246, 255',
  },
  asteroids: {
    large: {
      color: '#7657d9',
      fillOpacity: 0.1,
      lineWidth: 2,
    },
    medium: {
      color: '#a176ff',
      fillOpacity: 0.19,
      lineWidth: 2,
    },
    small: {
      color: '#ff66cd',
      fillOpacity: 0.16,
      lineWidth: 1.5,
    },
    detailColor: 'rgba(189, 168, 255, 0.22)',
  },
  pickups: {
    fillOpacity: 0.1,
    lineWidth: 2,
    shieldColor: '#67faff',
    triShotColor: '#ff72db',
    rapidFireColor: '#ffb35f',
    overdriveColor: '#ffe65f',
    extraShipColor: '#8eff94',
  },
  ufo: {
    bodyStrokeColor: '#ff4c91',
    bodyFillColor: 'rgba(255, 46, 118, 0.2)',
    canopyStrokeColor: '#ffd35d',
    canopyFillColor: 'rgba(255, 205, 88, 0.2)',
    lightColor: '255, 224, 91',
    healthTrackColor: 'rgba(3, 5, 14, 0.8)',
    healthColor: '#ffcf55',
  },
  projectiles: {
    playerColor: '#a8ffff',
    rapidTrailColor: '#ff6a16',
    rapidCoreColor: '#ffe55f',
    rapidTipColor: '#fffbd0',
    hostileTrailColor: '#ff3b35',
    hostileTipColor: '#fff08a',
  },
} as const;
