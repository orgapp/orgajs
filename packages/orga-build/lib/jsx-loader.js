import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { transform } from 'esbuild'

const loaderMap = {
	jsx: 'jsx',
	tsx: 'tsx',
	ts: 'ts',
}

export async function load(href, context, defaultLoad) {
	const url = new URL(href)

	const ext = url.pathname.split('.').pop()
	const loader = loaderMap[ext]
	if (!loader) {
		return defaultLoad(href, context, defaultLoad)
	}

	const { code, warnings } = await transform(String(await fs.readFile(url)), {
		format: 'esm',
		loader,
		sourcefile: fileURLToPath(url),
		sourcemap: 'both',
		target: 'esnext',
		jsx: 'automatic',
	})

	if (warnings) {
		for (const warning of warnings) {
			console.log(warning.location)
			console.log(warning.text)
		}
	}

	return { format: 'module', shortCircuit: true, source: code }
}
