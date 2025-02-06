import { argv } from 'node:process'
import { watch } from './lib/watch.js'
import { build, clean } from './lib/build.js'
import { parseArgs } from 'util'
import { serve } from './lib/serve.js'

const { values, positionals } = parseArgs({
	args: argv.slice(2),
	options: {
		watch: { type: 'boolean', short: 'w' },
		outDir: { type: 'string', short: 'o', default: 'out' },
	},
	tokens: true,
	allowPositionals: true,
})

build({ outDir: values.outDir }).then(() => {
	if (positionals.includes('dev')) {
		serve(values.outDir)
		watch('.', new RegExp(`^${values.outDir}`), async () => {
			console.log('rebuilding')
			await clean(values.outDir)
			await build({ outDir: values.outDir })
		})
	}
})
