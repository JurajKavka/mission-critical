import { rem } from 'polished';

/** Minimum viewport widths in pixels for mobile-first styles. */
export const BREAKPOINTS = {
  xs: 320,
  s: 480,
  compact: 600,
  m: 768,
  l: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const HEIGHT_BREAKPOINTS = {
  short: 360,
  landscape: 500,
  low: 680,
} as const;

type MediaOptions = {
  max?: boolean;
  maxHeight?: keyof typeof HEIGHT_BREAKPOINTS;
  pointer?: 'coarse' | 'fine';
  orientation?: 'landscape' | 'portrait';
  reducedMotion?: boolean;
};

/** Use as `${mb('s')} { ... }` inside a styled-components template. */
export const mb = (
  breakpoint: Breakpoint | null,
  options: MediaOptions = {},
): string => {
  const conditions = [
    breakpoint &&
      `(${options.max ? 'max' : 'min'}-width: ${rem(BREAKPOINTS[breakpoint])})`,
    options.maxHeight &&
      `(max-height: ${rem(HEIGHT_BREAKPOINTS[options.maxHeight])})`,
    options.pointer && `(pointer: ${options.pointer})`,
    options.orientation && `(orientation: ${options.orientation})`,
    options.reducedMotion && '(prefers-reduced-motion: reduce)',
  ].filter(Boolean);
  return `@media ${conditions.join(' and ')}`;
};
