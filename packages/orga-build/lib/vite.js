import path from 'node:path'
import { setup } from './files.js'
import { clientRuntime } from './island.js'

const magicModulePrefix = '/@orga-build/'
const pagesModuleId = `${magicModulePrefix}pages`
const endpointsModuleId = `${magicModulePrefix}endpoints`
/** URL the dev server serves the island runtime from. */
export const islandRuntimeId = `${magicModulePrefix}islands.js`
const contentModuleId = 'orga-build:content'
const contentModuleIdResolved = `\0${contentModuleId}`
const endpointModulePrefix = `${endpointsModuleId}/__route__/`

/**
 * @param {Object} options
 * @param {string} options.dir
 * @param {string[]} [options.exclude]
 * @returns {import('vite').Plugin}
 */
export function pluginFactory({ dir, exclude = [] }) {
	/** @type {ReturnType<typeof setup>} */
	let files
	/** @type {import('vite').ViteDevServer | undefined} */
	let server
	const contentDir = path.resolve(dir)

	/**
	 * Whether a changed file lives in the content root, skipping dot paths the
	 * same way route discovery does.
	 * @param {string} file
	 */
	function isContentFile(file) {
		const rel = path.relative(contentDir, file)
		if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false
		return !rel.split(path.sep).some((segment) => segment.startsWith('.'))
	}

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

		configResolved(config) {
			// Exclude the outDir Vite actually writes the site to (it may sit inside
			// the content root), so generated files are never discovered as routes.
			// Read it from the client environment: during a build, `config.build`
			// is the current environment's (e.g. the SSR outDir).
			const outDir = config.environments.client.build.outDir
			files = setup(dir, { outDir: path.resolve(config.root, outDir), exclude })
		},

		async configureServer(_server) {
			server = _server
			// Eagerly run file discovery so route conflicts surface at startup
			await files.pages()
			await files.endpoints()
		},

		hotUpdate({ file }) {
			// Content changes affect routes; files the server renders affect pages.
			// Anything else in the project (logs, editor backups, tool state) must
			// not trigger a reload.
			const rendered =
				server?.environments.ssr.moduleGraph.getModulesByFile(file)
			if (!isContentFile(file) && !rendered?.size) return
			// Invalidate in-memory file caches so added/removed routes are picked up
			files.invalidate()
			// Invalidate content module when content files change
			const module = this.environment.moduleGraph.getModuleById(
				contentModuleIdResolved
			)
			if (module) this.environment.moduleGraph.invalidateModule(module)
			// Pages render on the server: the browser has nothing to hot-swap,
			// so reload it.
			if (this.environment.name === 'client') {
				this.environment.hot.send({ type: 'full-reload', path: '*' })
			}
		},

		async resolveId(id, _importer) {
			// Pages with islands link the runtime by a stable URL; point it at the
			// real file so Vite treats it like any other source module.
			if (id === islandRuntimeId) {
				return clientRuntime
			}
			if (id === contentModuleId) {
				return contentModuleIdResolved
			}
			if (id.startsWith(magicModulePrefix)) {
				return id
			}
		},
		async load(id) {
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
				if (!page) return
				// Org pages take `_components` as the `components` prop.
				if (page.dataPath.endsWith('.org')) {
					return `
import { createElement } from 'react';
import Content from '${page.dataPath}';
import * as components from '${magicModulePrefix}components';
export * from '${page.dataPath}';
export default (props) => createElement(Content, { components: { ...components }, ...props });
`
				}
				return `
export * from '${page.dataPath}';
export {default} from '${page.dataPath}';
`
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
