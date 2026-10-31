import { defineConfig, type Plugin } from 'vite';
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup';

const singleFile = (): Plugin => ({
  name: 'mission-critical-single-file',
  enforce: 'post',
  generateBundle: (_options, bundle: OutputBundle) => {
    const htmlEntry = Object.entries(bundle).find(
      ([fileName, output]) =>
        fileName.endsWith('.html') && output.type === 'asset',
    ) as [string, OutputAsset] | undefined;

    if (!htmlEntry) {
      throw new Error('The build did not emit an HTML entry point.');
    }

    const [htmlFileName, htmlAsset] = htmlEntry;
    let html = String(htmlAsset.source);

    for (const [fileName, output] of Object.entries(bundle)) {
      if (output.type === 'chunk' && output.isEntry) {
        const chunk = output as OutputChunk;
        const scriptPattern = new RegExp(
          `<script([^>]*?)src=["'][^"']*${fileName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}["']([^>]*)><\\/script>`,
        );
        html = html.replace(
          scriptPattern,
          `<script$1$2>${chunk.code}</script>`,
        );
        delete bundle[fileName];
      } else if (output.type === 'asset' && fileName.endsWith('.css')) {
        const stylesheetPattern = new RegExp(
          `<link([^>]*?)href=["'][^"']*${fileName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}["']([^>]*)>`,
        );
        html = html.replace(
          stylesheetPattern,
          `<style>${String(output.source)}</style>`,
        );
        delete bundle[fileName];
      }
    }

    htmlAsset.source = html;
    bundle[htmlFileName] = htmlAsset;
  },
});

export default defineConfig({
  root: 'graphics',
  plugins: [singleFile()],
  build: {
    target: 'es2022',
    outDir: '../dist/graphics',
    emptyOutDir: false,
  },
});
