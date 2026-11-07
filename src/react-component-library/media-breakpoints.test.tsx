import { renderToString } from 'react-dom/server';
import styled, { ServerStyleSheet } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { BREAKPOINTS, mb } from './media-breakpoints';

describe('mobile-first media breakpoints', () => {
  it('exposes ordered minimum viewport widths', () => {
    const widths = Object.values(BREAKPOINTS);
    expect(widths).toEqual([320, 480, 600, 768, 1024, 1280, 1536]);
    expect(
      widths.every((width, index) => index === 0 || width > widths[index - 1]),
    ).toBe(true);
  });

  it('supports named maximum widths and compact landscape conditions', () => {
    expect(mb('compact', { max: true })).toBe('@media (max-width: 37.5rem)');
    expect(
      mb('l', {
        max: true,
        pointer: 'coarse',
        maxHeight: 'landscape',
        orientation: 'landscape',
      }),
    ).toBe(
      '@media (max-width: 64rem) and (max-height: 31.25rem) and (pointer: coarse) and (orientation: landscape)',
    );
    expect(mb(null, { reducedMotion: true })).toBe(
      '@media (prefers-reduced-motion: reduce)',
    );
  });

  it('can be interpolated into a styled component', () => {
    const Example = styled.div`
      ${mb('s')} {
        color: red;
      }
    `;
    const sheet = new ServerStyleSheet();
    try {
      renderToString(sheet.collectStyles(<Example />));
      expect(sheet.getStyleTags()).toMatch(/@media \(min-width:\s*30rem\)/);
      expect(sheet.getStyleTags()).toContain('color:red');
    } finally {
      sheet.seal();
    }
  });
});
