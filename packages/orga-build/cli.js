#!/usr/bin/env node

import { argv } from 'node:process'
import { parseArgs } from 'node:util'
import { watch } from './lib/watch.js'
import { build } from './lib/esbuild/build.js'
import { loadConfig } from './lib/config.js'
import { serve } from './lib/serve.js'

const { values, positionals } = parseArgs({
	args: argv.slice(2),
	options: {
		watch: { type: 'boolean', short: 'w' },
		outDir: { type: 'string', short: 'o', default: 'out' }
	},
	tokens: true,
	allowPositionals: true
})

const config = await loadConfig(
	process.cwd(),
	'orga.config.js',
	'orga.config.ts'
)

await build(config)

if (positionals.includes('dev')) {
	serve(values.outDir)
	watch('.', new RegExp(`^${config.outDir}`), async () => {
		console.log('rebuilding')
		// await clean(config.outDir)
		await build(config)
	})
}
