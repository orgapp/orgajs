import path from 'node:path'
import { setup } from './files.js'

const magicModulePrefix = '/@orga-build/'
const pagesModuleId = `${magicModulePrefix}pages`
const endpointsModuleId = `${magicModulePrefix}endpoints`
export const appEntryId = `${magicModulePrefix}main.js`
const contentModuleId = 'orga-build:content'
const contentModuleIdResolved = `\0${contentModuleId}`
const endpointModulePrefix = `${endpointsModuleId}/__route__/`

/**
 * @param {Object} options
 * @param {string} options.dir
 * @param {string} [options.outDir]
 * @param {string[]} [options.styles]
 * @param {string[]} [options.exclude]
 * @returns {import('vite').Plugin}
 */
export function pluginFactory({ dir, outDir, styles = [], exclude = [] }) {
	const files = setup(dir, { outDir, exclude })

	return {
		name: 'vite-plugin-orga-pages',
		enforce: 'pre',
		config: (_config, _env) => ({
			future: {
				removePluginHookSsrArgument: 'warn',
				removePluginHookHandleHotUpdate: 'warn',
				removeSsrLoadModule: 'warn'
			}
		}),

		async configureServer(_server) {
			// Eagerly run file discovery so route conflicts surface at startup
			await files.pages()
			await files.endpoints()
		},

		hotUpdate() {
			// Invalidate in-memory file caches so added/removed routes are picked up
			files.invalidate()
			// Invalidate content module when content files change
			const module = this.environment.moduleGraph.getModuleById(
				contentModuleIdResolved
			)
			if (module) {
				this.environment.moduleGraph.invalidateModule(module)
				// Full reload for now; can optimize to HMR later
				this.environment.hot.send({ type: 'full-reload', path: '*' })
			}
		},

		async resolveId(id, _importer) {
			if (id === appEntryId) {
				return appEntryId
			}
			if (id === contentModuleId) {
				return contentModuleIdResolved
			}
			if (id.startsWith(magicModulePrefix)) {
				return id
			}
		},
		async load(id) {
			if (id === appEntryId) {
				const styleImports = styles
					.map((styleUrl) => `import ${JSON.stringify(styleUrl)};`)
					.join('\n')
				return `${styleImports}\nimport "orga-build/csr";`
			}
			if (id === contentModuleIdResolved) {
				return await renderContentModule()
			}
			if (id === pagesModuleId) {
				return await renderPageList()
			}
			if (id === endpointsModuleId) {
				return await renderEndpointList()
			}
			if (id.startsWith(pagesModuleId)) {
				const pageId = id.replace(pagesModuleId, '')
				const page = await files.page(pageId)
				if (page) {
					return `
export * from '${page.dataPath}';
export {default} from '${page.dataPath}';
`
				}
			}
			if (id.startsWith(endpointModulePrefix)) {
				const routeHex = id.slice(endpointModulePrefix.length)
				const endpointId = Buffer.from(routeHex, 'hex').toString('utf-8')
				const endpoint = await files.endpoint(endpointId)
				if (endpoint) {
					return `export * from '${endpoint.dataPath}';`
				}
			}

			if (id === `${magicModulePrefix}layouts`) {
				const layouts = await files.layouts()
				/** @type {string[]} */
				const imports = []
				const lines = Object.entries(layouts).map(([key, value], i) => {
					imports.push(`import Layout${i} from '${value}'`)
					return `layouts['${key}'] = Layout${i}`
				})
				return `
${imports.join('\n')}
const layouts = {};
${lines.join('\n')}
export default layouts;
				`
			}

			if (id === `${magicModulePrefix}components`) {
				return await renderComponents()
			}
		}
	}

	async function renderPageList() {
		const pages = await files.pages()
		return renderModuleMap('pages', pages, (id) =>
			path.join(magicModulePrefix, 'pages', id)
		)
	}

	async function renderEndpointList() {
		const endpoints = await files.endpoints()
		return renderModuleMap(
			'endpoints',
			endpoints,
			(route) => endpointModulePrefix + Buffer.from(route).toString('hex')
		)
	}

	/**
	 * @param {string} name
	 * @param {Record<string, unknown>} entries
	 * @param {(key: string) => string} toModulePath
	 */
	function renderModuleMap(name, entries, toModulePath) {
		/** @type {string[]} */
		const imports = []
		/** @type {string[]} */
		const assignments = []
		Object.keys(entries).forEach((key, i) => {
			imports.push(`import * as m${i} from '${toModulePath(key)}'`)
			assignments.push(`${name}['${key}'] = m${i}`)
		})
		return [
			imports.join('\n'),
			`const ${name} = {};`,
			assignments.join('\n'),
			`export default ${name};`
		].join('\n')
	}

	async function renderComponents() {
		const components = await files.components()
		if (components) {
			return `export * from '${components}'`
		}
		return ''
	}

	async function renderContentModule() {
		const entries = await files.contentEntries()
		const manifest = JSON.stringify(entries, null, 2)

		return `
const __entries = ${manifest}

function normalizePath(path = '') {
  return String(path).replace(/^\\/+|\\/+$/g, '')
}

function pathMatches(entryPath, queryPath) {
  const e = normalizePath(entryPath)
  const q = normalizePath(queryPath)
  if (!q) return true
  return e === q || e.startsWith(q + '/')
}

export function getPages(path = '', filter) {
  const list = __entries.filter((e) => pathMatches(e.path, path))
  return typeof filter === 'function' ? list.filter(filter) : list
}

export function getPage(idOrSlug, path = '') {
  return __entries.find((e) => {
    if (!pathMatches(e.path, path)) return false
    return e.id === idOrSlug || e.slug === idOrSlug
  })
}

export function getEntries(refs) {
  return refs.map((r) => getPage(r.id, r.path || ''))
}

export const getCollection = getPages
export const getEntry = getPage
`
	}
}
