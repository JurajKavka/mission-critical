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
      expect(styles).toContain('padding:4.375rem 1.125rem 1.875rem');
      expect(styles).toContain('padding:2rem 2rem');
    } finally {
      sheet.seal();
    }
  });
});
