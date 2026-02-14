#!/usr/bin/env node

import { argv } from 'node:process'
import { parseArgs } from 'node:util'
import { loadConfig } from './lib/config.js'
import { build } from './lib/build.js'
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

const config = await loadConfig('orga.config.js', 'orga.config.mjs')

await (positionals.includes('dev') ? serve(config) : build(config))
