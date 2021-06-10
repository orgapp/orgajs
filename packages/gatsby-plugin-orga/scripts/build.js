require('esbuild').build({
  entryPoints: [
    'src/gatsby-node.ts',
    'src/orga-renderer.ts',
  ],
  bundle: true,
  external: [
    '@typescript-eslint/typescript-estree',
    'astring',
    'react', '@orgajs/react', 'lodash', 'date-fns-tz', 'mime', 'unist-builder', 'unified',
  ],
  platform: 'node',
  outdir: 'dist',
}).catch(() => process.exit(1))
