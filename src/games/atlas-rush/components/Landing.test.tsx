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
      expect(html).toContain('Start survey');
      const fieldsets =
        html.match(/<fieldset\b[^>]*>[\s\S]*?<\/fieldset>/g) ?? [];
      const settingsGroups = [
        { legend: 'Select a region', inputNames: ['region'] },
        { legend: 'Select a level', inputNames: ['level'] },
        { legend: 'Select a mode', inputNames: ['learning', 'speed'] },
      ];
      settingsGroups.forEach(({ legend, inputNames }) => {
        const fieldset = fieldsets.find((markup) =>
          markup.includes(`<legend>${legend}</legend>`),
        );
        expect(fieldset).toMatch(/^<fieldset\b[^>]*\bdisabled=""/);
        inputNames.forEach((inputName) => {
          expect(fieldset).toContain(`name="${inputName}"`);
        });
      });
      expect(styles).toContain('max-width:77rem;');
      expect(styles).toContain('padding:0 1rem;');
      expect(styles).toContain('font-size:1rem;');
      expect(styles).toContain('clip-path:polygon(');
    } finally {
      sheet.seal();
    }
  });
});
