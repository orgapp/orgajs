import * as esbuild from 'esbuild'
import * as fs from 'node:fs/promises'

const { metafile } = await esbuild.build({
	entryPoints: ['js/layout.ts', 'js/editor.ts', 'js/playground.ts'],
	format: 'esm',
	outdir: 'out',
	bundle: true,
	minify: true,
	metafile: true,
	plugins: [],
	splitting: true,
})

// write metafile to meta.json
await fs.writeFile('meta.json', JSON.stringify(metafile))
