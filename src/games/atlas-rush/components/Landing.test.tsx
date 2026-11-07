import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';
import { describe, expect, it } from 'vitest';
import { Landing } from './Landing';

describe('Atlas Rush settings page', () => {
  it('renders the settings and their styles on the server', () => {
    const sheet = new ServerStyleSheet();
    try {
      const html = renderToString(sheet.collectStyles(<Landing />));
      const styles = sheet.getStyleTags();
      expect(html).toContain('Select a region');
      expect(html).toContain('Start survey');
      expect(html).toContain('disabled');
      expect(styles).toContain('padding:70px 18px 30px');
      expect(styles).toContain('padding:32px 42px');
    } finally {
      sheet.seal();
    }
  });
});
