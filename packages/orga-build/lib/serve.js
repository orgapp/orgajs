import { createServer } from 'vite'
import { createOrgaBuildConfig } from './plugin.js'

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
		exclude: config.exclude ?? [],
		site: config.site
	})

	const server = await createServer({
		root: projectRoot,
		plugins,
		server: { port, strictPort: false }
	})

	await server.listen()
	server.printUrls()
}
