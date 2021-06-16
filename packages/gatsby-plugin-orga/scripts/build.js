const watch = process.argv.length > 2 && process.argv[2] === '-w'

require('esbuild').build({
  entryPoints: [
    'src/gatsby-node.ts',
    'src/orga-renderer.ts',
    'src/wrap-root-render-html-entry.tsx',
  ],
  bundle: true,
  external: [
    '@typescript-eslint/typescript-estree',
    'astring',
    'react', '@orgajs/react', 'react-dom/server',
    'lodash', 'date-fns-tz', 'mime', 'unist-builder', 'unified',
    'webpack', 'path',
    'p-queue', 'dataloader',
    './wrap-root-render-html-entry.js',
  ],
  platform: 'node',
  outdir: 'dist',
  watch,
}).catch(() => process.exit(1))
