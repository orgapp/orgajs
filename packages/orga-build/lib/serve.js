import path from 'node:path'
import { createServer } from 'vite'
import { createOrgaBuildConfig } from './plugin.js'

/**
 * Start the development server using native Vite.
 *
 * @param {import('./config.js').Config} config
 * @param {number} [port]
 */
export async function serve(config, port = 3000) {
	const { plugins, resolve } = createOrgaBuildConfig({
		root: config.root,
		outDir: config.outDir,
		containerClass: config.containerClass,
		vitePlugins: config.vitePlugins,
		includeFallbackHtml: true
	})

	const server = await createServer({
		root: config.root,
		plugins,
		resolve,
		appType: 'custom',
		server: {
			port,
			strictPort: false,
			watch: {
				ignored: [path.resolve(config.outDir) + '/**']
			}
		}
	})

	await server.listen()
	server.printUrls()
}
