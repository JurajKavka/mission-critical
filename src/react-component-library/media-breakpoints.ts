import { rem } from 'polished';

/** Minimum viewport widths in pixels for mobile-first styles. */
export const BREAKPOINTS = {
  xs: 320,
  s: 480,
  m: 768,
  l: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/** Use as `${mb('s')} { ... }` inside a styled-components template. */
export const mb = (breakpoint: Breakpoint): string =>
  `@media (min-width: ${rem(BREAKPOINTS[breakpoint])})`;
