import path from 'node:path'
import { createServer } from 'vite'
import { alias, createOrgaBuildConfig } from './plugin.js'

/**
 * Start the development server using native Vite.
 *
 * @param {import('./config.js').Config} config
 * @param {number} [port]
 * @param {string} [projectRoot]
 */
export async function serve(config, port = 3000, projectRoot = process.cwd()) {
	const { plugins } = createOrgaBuildConfig({
		root: config.root,
		outDir: config.outDir,
		containerClass: config.containerClass,
		styles: config.styles ?? [],
		rehypePlugins: config.rehypePlugins ?? [],
		vitePlugins: config.vitePlugins,
		includeFallbackHtml: true,
		projectRoot,
		exclude: config.exclude ?? []
	})

	const server = await createServer({
		plugins,
		appType: 'custom',
		// Aliases are scoped to the client environment only.
		// The SSR environment must NOT have these aliases: they convert bare specifiers
		// (e.g. 'react') into absolute paths, which bypasses Vite's fetchModule
		// externalization branch and causes CJS packages to be evaluated inline by
		// ESModulesEvaluator (which has no 'module'/'require' globals).
		environments: {
			client: {
				resolve: /** @type {any} */ ({ alias }),
				// The aliases resolve to file paths and the client entry lives in
				// orga-build itself, so Vite never discovers these CJS modules.
				// Pre-bundle them explicitly or the browser gets raw CommonJS.
				optimizeDeps: {
					include: [
						'react-dom/client',
						'orga-build > wouter > use-sync-external-store/shim/index.js'
					]
				}
			}
		},
		server: {
			port,
			strictPort: false,
			watch: {
				ignored: [`${path.resolve(config.outDir)}/**`]
			}
		}
	})

	await server.listen()
	server.printUrls()
}
