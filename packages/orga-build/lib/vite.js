import { setup } from './files.js'
import path from 'node:path'

const magicModulePrefix = '@orga-build'
const appEntryId = `/${magicModulePrefix}/main.js`

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
		configureServer({ watcher, moduleGraph }) {
			const reloadVirtualModule = (/** @type {string} */ moduleId) => {
				const module = moduleGraph.getModuleById(moduleId)
				if (module) {
					moduleGraph.invalidateModule(module)
					watcher.emit('change', moduleId)
				}
			}

			reloadVirtualModule('/')
		},

		buildStart() {
		},

		async resolveId(id, importer) {
			if (id === appEntryId) {
				return appEntryId
			}
			if (id.startsWith(magicModulePrefix)) {
				return id
			}
		},
		async load(id) {
			if (id === appEntryId) {
				return `import "orga-build/csr.jsx";`
			}
			if (id === `${magicModulePrefix}/pages`) {
				return await renderPageList()
			}
			if (id.startsWith(`${magicModulePrefix}/pages/`)) {
				let pageId = id.replace(`${magicModulePrefix}/pages/`, '/')
				const page = await files.page(pageId)
				if (page) {
					return `
export * from '${page.dataPath}';
export {default} from '${page.dataPath}';
`
				}
			}

			if (id === `${magicModulePrefix}/layouts`) {
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

			if (id === `${magicModulePrefix}/components`) {
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
}
