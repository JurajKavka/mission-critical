// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

const siteUrl =
  /** @type {any} */ (globalThis).process?.env?.SITE_URL ||
  'https://mission-critical.sk';

export default defineConfig({
  site: siteUrl,
  integrations: [react()],
  adapter: cloudflare(),
  base: '/',
  output: 'static',
  build: {
    format: 'directory',
  },
});
