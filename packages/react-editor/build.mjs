// build.mjs
import esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/index.tsx'],
	outdir: 'dist',
	bundle: false,
	format: 'esm',
	splitting: false,
	sourcemap: false,
	minify: false,
	target: 'esnext',
	jsx: 'automatic'
	// external: ['react', 'react-dom']
})
