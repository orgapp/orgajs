#!/usr/bin/env node

import path from 'node:path'
import { argv } from 'node:process'
import { parseArgs } from 'node:util'
import { build } from './lib/build.js'
import { loadConfig } from './lib/config.js'
import { serve } from './lib/serve.js'

const { values, positionals } = parseArgs({
	args: argv.slice(2),
	options: {
		outDir: { type: 'string', short: 'o' }
	},
	allowPositionals: true
})

const { config, projectRoot } = await loadConfig(
	'orga.config.js',
	'orga.config.mjs'
)
if (values.outDir) config.outDir = path.resolve(values.outDir)

await (positionals.includes('dev')
	? serve(config, 3000, projectRoot)
	: build(config, projectRoot))
