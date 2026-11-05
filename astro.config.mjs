// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const siteUrl = /** @type {any} */ (globalThis).process?.env?.SITE_URL;

export default defineConfig({
  site: siteUrl,
  integrations: [react()],
  base: '/',
  output: 'static',
  build: {
    format: 'directory',
  },
});
