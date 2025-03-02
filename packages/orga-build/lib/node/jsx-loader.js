import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { transform } from 'esbuild'

/**
 * @param {string} href
 *   URL.
 * @param {unknown} context
 *   Context.
 * @param {Function} defaultLoad
 *   Default `load`.
 * @returns
 *   Result.
 */
export async function load(href, context, defaultLoad) {
	const url = new URL(href)

	const loader = getLoader(url.pathname)
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

/**
 * @param {string} filename
 * @returns {import('esbuild').Loader | null}
 */
function getLoader(filename) {
	const ext = filename.split('.').pop()
	switch (ext) {
		case 'jsx':
			return 'jsx'
		case 'tsx':
			return 'tsx'
		case 'ts':
			return 'ts'
		default:
			return null
	}
}
