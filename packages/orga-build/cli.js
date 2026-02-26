#!/usr/bin/env node

import { argv } from 'node:process'
import { parseArgs } from 'node:util'
import { build } from './lib/build.js'
import { loadConfig } from './lib/config.js'
import { serve } from './lib/serve.js'

const { positionals } = parseArgs({
	args: argv.slice(2),
	options: {
		watch: { type: 'boolean', short: 'w' },
		outDir: { type: 'string', short: 'o', default: '.out' }
	},
	tokens: true,
	allowPositionals: true
})

const { config, projectRoot } = await loadConfig(
	'orga.config.js',
	'orga.config.mjs'
)

await (positionals.includes('dev')
	? serve(config, 3000, projectRoot)
	: build(config, projectRoot))
