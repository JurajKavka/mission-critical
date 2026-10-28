// @ts-check
import { defineConfig } from 'astro/config';

const productionBase = '/mission-critical';
const command = /** @type {any} */ (globalThis).process?.argv?.[2];
const base =
  command === 'build' || command === 'preview' ? productionBase : '/';

export default defineConfig({
  site: 'https://jurajkavka.github.io',
  base,
  output: 'static',
  build: {
    format: 'directory',
  },
});
