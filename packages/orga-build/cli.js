#!/usr/bin/env node

import { argv, cwd } from 'node:process'
import { parseArgs } from 'node:util'
import { loadConfig } from './lib/config.js'
import { build } from './lib/vite/build.js'
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

const dir = cwd()

const config = await loadConfig(dir, 'orga.config.js', 'orga.config.mjs')

await build(config)

if (positionals.includes('dev')) {
	await serve(config)
}
