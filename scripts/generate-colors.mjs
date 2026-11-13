import { readFile, writeFile } from 'node:fs/promises';

const paletteUrl = new URL('../src/styles/colors.json', import.meta.url);
const stylesheetUrl = new URL('../src/styles/colors.css', import.meta.url);
const palette = JSON.parse(await readFile(paletteUrl, 'utf8'));
const declarations = Object.entries(palette).flatMap(([name, color]) => {
  const channels = color
    .match(/[\da-f]{2}/gi)
    .map((channel) => parseInt(channel, 16));
  return [
    `  --color-${name}: ${color};`,
    `  --color-${name}-rgb: ${channels.join(', ')};`,
  ];
});

await writeFile(
  stylesheetUrl,
  `/* Generated from colors.json by scripts/generate-colors.mjs. */\n:root {\n${declarations.join('\n')}\n}\n`,
);
