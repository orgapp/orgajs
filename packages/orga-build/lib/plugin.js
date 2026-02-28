import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { createServerModuleRunner } from 'vite'
import { resolveEndpointResponse } from './endpoint.js'
import { setupOrga } from './orga.js'
import { escapeHtml } from './util.js'
import { pluginFactory } from './vite.js'

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))

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
 * @property {string[]} [styles] - Global stylesheet URLs to import/inject
 * @property {import('unified').PluggableList} [rehypePlugins] - Extra rehype plugins appended to orga-build defaults
 */

/**
 * Creates the canonical orga-build plugin preset.
 * This is the single composition path used by both dev and build.
 *
 * @param {OrgaBuildPluginOptions} options
 * @returns {import('vite').PluginOption[]}
 */
export function orgaBuildPlugin({
	root,
	outDir,
	containerClass = [],
	styles = [],
	rehypePlugins = []
}) {
	return [
		setupOrga({ containerClass, root, rehypePlugins }),
		react(),
		pluginFactory({ dir: root, outDir, styles })
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
	styles = [],
	rehypePlugins = [],
	vitePlugins = [],
	includeFallbackHtml = false,
	projectRoot = process.cwd()
}) {
	const plugins = [
		...vitePlugins,
		...orgaBuildPlugin({ root, outDir, containerClass, styles, rehypePlugins })
	]
	if (includeFallbackHtml) {
		// HTML fallback must be first so it can handle HTML navigation requests
		// before runtime plugins (e.g. Cloudflare) potentially return 404.
		plugins.unshift(htmlFallbackPlugin(projectRoot, styles))
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
 * This plugin performs per-request SSR in dev mode (matching Astro/SvelteKit behaviour):
 * - SSR-renders each page on every request using Vite's server module runner
 * - Injects rendered content and page metadata (%orga.*% placeholders) into the template
 * - Falls back to the shell HTML for unknown routes (client-side router handles 404)
 * - Only handles GET/HEAD requests that accept HTML
 * - Does not intercept asset requests
 *
 * @param {string} projectRoot - Project root directory (where orga.config.js lives)
 * @param {string[]} [styles]
 * @returns {import('vite').Plugin}
 */
export function htmlFallbackPlugin(projectRoot, styles = []) {
	return {
		name: 'orga-build:html-fallback',

		async configureServer(server) {
			// Determine which index.html to use at startup
			// Look for user's index.html in project root (where orga.config.js lives)
			const userIndexPath = path.join(projectRoot, 'index.html')
			const userHasIndex = await hasUserIndexHtml(projectRoot)
			const indexHtmlPath = userHasIndex ? userIndexPath : defaultIndexHtml

			// CJS compatibility here depends on Vite externalizing bare-specifier deps
			// (e.g. react/*) to native Node import(). If aliases rewrite specifiers
			// to absolute paths, modules can be inlined and evaluated without CJS globals.
			const runner = createServerModuleRunner(server.environments.ssr)

			server.middlewares.use(async (req, res, next) => {
				// Only handle GET/HEAD requests
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next()
				}

				const url = req.url || '/'
				const pathname = url.split('?')[0]

				// Endpoint routes are handled first and bypass HTML fallback.
				try {
					const { endpoints } = await runner.import(ssrEntry)
					const endpointModule = endpoints?.[pathname]
					if (endpointModule) {
						const ctx = {
							url: new URL(url, `http://${req.headers.host || 'localhost'}`),
							params: {},
							mode: /** @type {'dev'} */ ('dev'),
							route: { route: pathname }
						}

						const response = await resolveEndpointResponse(
							endpointModule,
							ctx,
							req.method
						)
						res.statusCode = response.status
						response.headers.forEach((headerValue, headerName) => {
							res.setHeader(headerName, headerValue)
						})
						if (req.method === 'HEAD') {
							res.end()
							return
						}
						const bytes = Buffer.from(await response.arrayBuffer())
						res.end(bytes)
						return
					}
				} catch (e) {
					next(e)
					return
				}

				// Only handle browser-like navigation requests.
				// Don't match generic */* accepts to avoid hijacking API requests.
				const accept = req.headers.accept || ''
				if (!accept.includes('text/html')) {
					return next()
				}

				// Don't intercept asset requests (files with extensions)
				if (pathname !== '/' && /\.\w+$/.test(pathname)) {
					return next()
				}

				try {
					// Import via the runner on each request — the module graph handles
					// HMR invalidation so stale modules are never served.
					const { render, pages } = await runner.import(ssrEntry)
					const content = render(pathname)

					let html = await fs.readFile(indexHtmlPath, 'utf-8')
					html = await server.transformIndexHtml(url, html)

					const uniqueCssUrls = [...new Set(styles)]
					if (uniqueCssUrls.length > 0) {
						const cssLinks = uniqueCssUrls
							.map((u) => `<link rel="stylesheet" href="${escapeHtml(u)}">`)
							.join('')
						html = html.replace('</head>', `${cssLinks}</head>`)
					}

					if (content) {
						const ssr = { routePath: pathname }
						html = html.replace(
							'<div id="root"></div>',
							`<script>window._ssr=${JSON.stringify(ssr)};</script><div id="root">${content}</div>`
						)
					}

					// Replace %orga.*% placeholders with page metadata
					const page = pages[pathname]
					if (page) {
						html = html.replace(/%orga\.(\w+)%/g, (_, key) => {
							const value = page[key] ?? ''
							return escapeHtml(String(value))
						})
					}
					// Strip any remaining unresolved placeholders (unknown route)
					html = html.replace(/%orga\.\w+%/g, '')

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
