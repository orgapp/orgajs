const watch = process.argv.length > 2 && process.argv[2] === '-w'

require('esbuild').build({
  entryPoints: [
    'src/index.tsx',
  ],
  platform: 'node',
  outdir: 'dist',
  watch,
}).catch(() => process.exit(1))
