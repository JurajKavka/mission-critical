import { renderToString } from 'react-dom/server';
import styled, { ServerStyleSheet } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { BREAKPOINTS, mb } from './media-breakpoints';

describe('mobile-first media breakpoints', () => {
  it('exposes ordered minimum viewport widths', () => {
    const widths = Object.values(BREAKPOINTS);
    expect(widths).toEqual([320, 480, 768, 1024, 1280, 1536]);
    expect(
      widths.every((width, index) => index === 0 || width > widths[index - 1]),
    ).toBe(true);
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
