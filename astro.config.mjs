// @ts-check
import { defineConfig } from 'astro/config';

const siteUrl = /** @type {any} */ (globalThis).process?.env?.SITE_URL;

export default defineConfig({
  site: siteUrl,
  base: '/',
  output: 'static',
  build: {
    format: 'directory',
  },
});
