const PIXELS_PER_REM = 16;

export const pixelsToRem = (pixels: number): string =>
  `${pixels / PIXELS_PER_REM}rem`;
