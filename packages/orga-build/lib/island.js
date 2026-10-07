import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizePath } from 'vite'

const serverEntry = fileURLToPath(new URL('./island.jsx', import.meta.url))
export const clientRuntime = fileURLToPath(
	new URL('./island-client.js', import.meta.url)
)
const implQuery = '?orga-island'
const directive = /^(?:\s|\/\/.*|\/\*[\s\S]*?\*\/)*(['"])use client\1/

/**
 * Islands: a module that starts with React's `'use client'` directive runs in
 * the browser. In the `ssr` environment each component it exports (named in
 * PascalCase, or the default export) is wrapped so it renders inside an
 * `<orga-island>` element (see `island.jsx`); hooks and other exports pass
 * through. In the browser the client runtime imports the real module and
 * hydrates it there. Pages without islands ship no JavaScript.
 *
 * Islands are discovered while the `ssr` environment is transformed, so the
 * `client` environment must be built after it: its `buildStart` emits a chunk
 * per island plus the runtime, and the client manifest maps them to hashed
 * files for prerendering.
 *
 * @returns {import('vite').Plugin}
 */
export function islandPlugin() {
	/** @type {Set<string>} */
	const islands = new Set()
	/** @type {string} */
	let root
	let ssrBuilt = false
	let clientBuiltAfterSsr = false
	/** @type {Set<string>} */
	const ssrAssets = new Set()

	return {
		name: 'orga-build:islands',

		api: {
			/** Whether the client build predates island discovery and lacks them. */
			get clientIsStale() {
				return islands.size > 0 && !clientBuiltAfterSsr
			},
			/** Files (relative to the SSR outDir) the SSR build emitted as assets. */
			ssrAssets
		},

		configResolved(config) {
			root = config.root
		},

		transform: {
			filter: { code: 'use client' },
			handler(code, id) {
				if (this.environment.name !== 'ssr' || id.includes(implQuery)) return
				if (!directive.test(code)) return
				const src = normalizePath(path.relative(root, id))
				const ast = this.parse(code)
				if (ast.body.some((node) => node.type === 'ExportAllDeclaration')) {
					this.error(`'use client' modules can't use \`export *\``)
				}
				const names = exportNames(ast)
				if (names.some(isComponentName)) islands.add(id)
				const exports = names.map((name) => {
					const binding =
						name === 'default' ? 'export default' : `export const ${name} =`
					const key = JSON.stringify(name)
					return isComponentName(name)
						? `${binding} island(impl[${key}], ${JSON.stringify(src)}, ${key})`
						: `${binding} impl[${key}]`
				})
				return [
					`import * as impl from ${JSON.stringify(id + implQuery)}`,
					`import { island } from ${JSON.stringify(serverEntry)}`,
					...exports
				].join('\n')
			}
		},

		buildEnd() {
			if (this.environment.name === 'ssr') ssrBuilt = true
		},

		// Pages live only in the SSR graph, so their images and CSS are emitted
		// there (see `emitAssets`); remember which files, for prerendering to
		// copy into the site. Source maps stay behind. `writeBundle` sees the
		// final bundle, after Vite's CSS plugin has added its file.
		writeBundle(_options, bundle) {
			if (this.environment.name !== 'ssr') return
			ssrAssets.clear()
			for (const output of Object.values(bundle)) {
				if (output.type === 'asset' && !output.fileName.endsWith('.map')) {
					ssrAssets.add(output.fileName)
				}
			}
		},

		buildStart() {
			if (this.environment.name !== 'client') return
			clientBuiltAfterSsr = ssrBuilt
			if (this.environment.mode !== 'build' || !islands.size) return
			for (const id of [...islands, clientRuntime]) {
				// Vite drops entry exports in app builds; the runtime needs them.
				this.emitFile({ type: 'chunk', id, preserveSignature: 'strict' })
			}
		}
	}
}

/**
 * Components are PascalCase by convention, as React Fast Refresh assumes.
 *
 * @param {string} name
 */
function isComponentName(name) {
	return name === 'default' || /^[A-Z]/.test(name)
}

/**
 * Names of a module's exports. Destructured exports are skipped.
 *
 * @param {ReturnType<import('vite').Rollup.PluginContext['parse']>} ast
 */
function exportNames(ast) {
	/** @type {string[]} */
	const names = []
	for (const node of ast.body) {
		if (node.type === 'ExportDefaultDeclaration') names.push('default')
		if (node.type !== 'ExportNamedDeclaration') continue
		const declaration = node.declaration
		if (declaration && 'declarations' in declaration) {
			for (const { id } of declaration.declarations) {
				if (id.type === 'Identifier') names.push(id.name)
			}
		} else if (declaration?.id && 'name' in declaration.id) {
			names.push(declaration.id.name)
		}
		for (const { exported } of node.specifiers) {
			names.push(
				exported.type === 'Identifier' ? exported.name : exported.value
			)
		}
	}
	return names
}
