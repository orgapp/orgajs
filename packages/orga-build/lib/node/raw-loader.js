import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

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
const rawLoader = async (href, context, defaultLoad) => {
	const url = new URL(href)
	const { searchParams } = url
	const raw = searchParams.get('raw')
	if (raw === null || raw === undefined || raw.toLowerCase() === 'false') {
		return defaultLoad(href, context, defaultLoad)
	}

	const filePath = fileURLToPath(href)
	const fileContent = readFileSync(filePath, 'utf8')
	return {
		format: 'module',
		shortCircuit: true,
		source: `export default ${JSON.stringify(fileContent)}`
	}
}

export const load = rawLoader
