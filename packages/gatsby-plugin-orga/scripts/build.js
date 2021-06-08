require('esbuild').build({
  entryPoints: [
    'src/gatsby-node.ts',
    'src/orga-renderer.ts',
  ],
  bundle: true,
  external: [
    '@typescript-eslint/typescript-estree',
    'astring',
    'react', '@orgajs/react',
  ],
  platform: 'node',
  outdir: 'dist',
  /* outfile: 'dist/out.js', */
}).catch(() => process.exit(1))
