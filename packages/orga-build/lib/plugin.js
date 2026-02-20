import path from 'node:path'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { setupOrga } from './orga.js'
import { pluginFactory } from './vite.js'

const require = createRequire(import.meta.url)
const defaultIndexHtml = fileURLToPath(new URL('./index.html', import.meta.url))

/**
 * Alias map for React and wouter to ensure consistent resolution
 */
export const alias = {
	react: path.dirname(require.resolve('react/package.json')),
	'react-dom': path.dirname(require.resolve('react-dom/package.json')),
	wouter: path.dirname(require.resolve('wouter'))
}

/**
 * @typedef {Object} OrgaBuildPluginOptions
 * @property {string} root - Root directory for content files
 * @property {string | undefined} [outDir] - Output directory (excluded from file discovery)
 * @property {string|string[]} [containerClass] - CSS class(es) to wrap rendered content
 */

/**
 * Creates the canonical orga-build plugin preset.
 * This is the single composition path used by both dev and build.
 *
 * @param {OrgaBuildPluginOptions} options
 * @returns {import('vite').PluginOption[]}
 */
export function orgaBuildPlugin({ root, outDir, containerClass = [] }) {
	return [
		setupOrga({ containerClass, root }),
		react(),
		pluginFactory({ dir: root, outDir })
	]
}

/**
 * Creates the full Vite config options for orga-build.
 * Includes plugins, resolve aliases, and other shared config.
 *
 * @param {OrgaBuildPluginOptions & { outDir?: string, vitePlugins?: import('vite').PluginOption[], includeFallbackHtml?: boolean, projectRoot?: string }} options
 * @returns {{ plugins: import('vite').PluginOption[], resolve: { alias: typeof alias } }}
 */
export function createOrgaBuildConfig({
	root,
	outDir,
	containerClass = [],
	vitePlugins = [],
	includeFallbackHtml = false,
	projectRoot = process.cwd()
}) {
	const plugins = [...vitePlugins, ...orgaBuildPlugin({ root, outDir, containerClass })]
	if (includeFallbackHtml) {
		// HTML fallback must be first so it can handle HTML navigation requests
		// before runtime plugins (e.g. Cloudflare) potentially return 404.
		plugins.unshift(htmlFallbackPlugin(projectRoot))
	}
	return {
		plugins,
		resolve: { alias }
	}
}

/**
 * Checks if a user-provided index.html exists in the project root.
 *
 * @param {string} root - Project root directory
 * @returns {Promise<boolean>}
 */
async function hasUserIndexHtml(root) {
	try {
		await fs.access(path.join(root, 'index.html'), fs.constants.F_OK)
		return true
	} catch {
		return false
	}
}

/**
 * Creates an HTML serving plugin that handles index.html for dev mode.
 *
 * This plugin:
 * - Serves user's index.html from project root if present, otherwise uses the default template
 * - Only handles GET/HEAD requests that accept HTML
 * - Runs late (post middleware) so other plugins get first chance
 * - Passes HTML through transformIndexHtml for ecosystem compatibility
 * - Does not intercept asset requests
 *
 * @param {string} projectRoot - Project root directory (where orga.config.js lives)
 * @returns {import('vite').Plugin}
 */
export function htmlFallbackPlugin(projectRoot) {
	return {
		name: 'orga-build:html-fallback',

		async configureServer(server) {
			// Determine which index.html to use at startup
			// Look for user's index.html in project root (where orga.config.js lives)
			const userIndexPath = path.join(projectRoot, 'index.html')
			const userHasIndex = await hasUserIndexHtml(projectRoot)
			const indexHtmlPath = userHasIndex ? userIndexPath : defaultIndexHtml

			// Add middleware to serve HTML early in the chain.
			server.middlewares.use(async (req, res, next) => {
				// Only handle GET/HEAD requests
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next()
				}

				// Only handle browser-like navigation requests.
				// Don't match generic */* accepts to avoid hijacking API requests.
				const accept = req.headers.accept || ''
				if (!accept.includes('text/html')) {
					return next()
				}

				// Don't intercept asset requests (files with extensions)
				const url = req.url || '/'
				const pathname = url.split('?')[0]
				if (pathname !== '/' && /\.\w+$/.test(pathname)) {
					return next()
				}

				try {
					let html = await fs.readFile(indexHtmlPath, 'utf-8')
					html = await server.transformIndexHtml(url, html)
					res.statusCode = 200
					res.setHeader('Content-Type', 'text/html')
					res.end(html)
				} catch (e) {
					next(e)
				}
			})
		}
	}
}
