import { argv } from 'node:process'
import { watch } from './lib/watch.js'
import { build, loadConfig, clean } from './lib/build.js'
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

const config = await loadConfig()
console.log('config', config)

await build(config)

if (positionals.includes('dev')) {
	serve(values.outDir)
	watch('.', new RegExp(`^${config.outDir}`), async () => {
		console.log('rebuilding')
		await clean(config.outDir)
		await build(config)
	})
}
