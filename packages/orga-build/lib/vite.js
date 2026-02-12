import { setup } from './files.js'
import path from 'node:path'

const magicModulePrefix = '/@orga-build/'
const pagesModuleId = magicModulePrefix + 'pages'
const appEntryId = `${magicModulePrefix}main.js`
const contentModuleId = 'orga-build:content'
const contentModuleIdResolved = '\0' + contentModuleId

/**
 * @param {Object} options
 * @param {string} options.dir
 * @returns {import('vite').Plugin}
 */
export function pluginFactory({ dir }) {
	const files = setup(dir)

	return {
		name: 'vite-plugin-orga-pages',
		enforce: 'pre',
		config: (config, env) => ({
			future: {
				removePluginHookSsrArgument: 'warn',
				removePluginHookHandleHotUpdate: 'warn',
				removeSsrLoadModule: 'warn'
			},
			optimizeDeps: {
				include: [
					'react',
					'react/jsx-runtime',
					'react-dom',
					'react-dom/client',
					'wouter'
				],
				exclude: ['orga-build']
			}
		}),

		configureServer(server) {
			const { watcher, moduleGraph, ws } = server

			// Invalidate content module on file changes
			watcher.on('change', (filePath) => {
				const module = moduleGraph.getModuleById(contentModuleIdResolved)
				if (module) {
					moduleGraph.invalidateModule(module)
					// Send HMR update to client
					ws.send({
						type: 'full-reload',
						path: '*'
					})
				}
			})
		},

		buildStart() {},

		async resolveId(id, importer) {
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
				return `import "orga-build/csr";`
			}
			if (id === contentModuleIdResolved) {
				return await renderContentModule()
			}
			if (id === pagesModuleId) {
				return await renderPageList()
			}
			if (id.startsWith(pagesModuleId)) {
				let pageId = id.replace(pagesModuleId, '')
				const page = await files.page(pageId)
				if (page) {
					return `
export * from '${page.dataPath}';
export {default} from '${page.dataPath}';
`
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
		/** @type {string[]} */ const _imports = []
		/** @type {string[]} */ const _pages = []
		Object.entries(pages).forEach(([pageId, value], i) => {
			const dataModulePath = path.join(magicModulePrefix, 'pages', pageId)
			_imports.push(`import * as page${i} from '${dataModulePath}'`)
			_pages.push(`pages['${pageId}'] = page${i}`)
		})
		return `
${_imports.join('\n')}
const pages = {};
${_pages.join('\n')}
export default pages;
	`
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
