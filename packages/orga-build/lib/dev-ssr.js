import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isCSSRequest, isRunnableDevEnvironment, normalizePath } from 'vite'
import { resolveEndpointResponse } from './endpoint.js'
import { readIndexHtml, renderPageHtml } from './html.js'
import { islandRuntimeId } from './vite.js'

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))

/**
 * Serves pages and endpoints in dev, rendering each request on the server
 * (matching Astro/SvelteKit behaviour):
 * - Endpoint routes are answered from their `GET`/`HEAD` handlers
 * - Pages are SSR-rendered through the `ssr` environment's module runner, so
 *   edits are picked up without restarting
 * - Unknown routes get the bare shell (the client-side router handles 404)
 * - Only GET/HEAD requests that accept HTML are rendered; assets pass through
 *
 * @returns {import('vite').Plugin}
 */
export function devSsrPlugin() {
	return {
		name: 'orga-build:dev-ssr',
		// Run before other plugins' middlewares (e.g. Cloudflare) so HTML
		// navigation requests are not answered with a 404 first.
		enforce: 'pre',

		configureServer(server) {
			const ssr = server.environments.ssr
			if (!isRunnableDevEnvironment(ssr)) {
				server.config.logger.warn(
					'[orga-build] the "ssr" environment is not runnable in this process; dev SSR is disabled'
				)
				return
			}

			// The browser imports islands straight from source, served by Vite
			// under its `base`. The shell's own URLs are rebased by Vite in
			// `transformIndexHtml`; these are injected afterwards.
			const { root, base } = server.config
			/** @param {string} src */
			const islandUrl = (src) =>
				// Outside the root (`..`, or another drive on Windows): Vite's /@fs/ form.
				src.startsWith('..') || path.isAbsolute(src)
					? `${base}@fs/${normalizePath(path.resolve(root, src)).replace(/^\//, '')}`
					: base + src
			const islandScript = base + islandRuntimeId.slice(1)
			// CSS imported by server-rendered code never reaches the browser's
			// module graph: link each file, which Vite serves as plain CSS.
			const styles = () =>
				[...ssr.moduleGraph.idToModuleMap.keys()]
					.filter(
						(id) => isCSSRequest(id) && path.isAbsolute(id) && !id.includes('?')
					)
					.map((id) => islandUrl(normalizePath(path.relative(root, id))))

			server.middlewares.use(async (req, res, next) => {
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next()
				}

				// This runs before Vite's own middlewares, so `base` is still in the URL.
				const url = req.url || '/'
				const requestPath = url.split('?')[0]
				if (!requestPath.startsWith(base)) return next()
				// Directory-style URLs (`/docs/`) are the same page as `/docs`.
				const pathname = requestPath
					.slice(base.length - 1)
					.replace(/(.)\/+$/, '$1')

				try {
					// The runner follows the module graph, so stale modules are never served.
					const { render, pages, endpoints } = await ssr.runner.import(ssrEntry)

					// Endpoint routes are handled first and bypass HTML rendering.
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
						res.end(Buffer.from(await response.arrayBuffer()))
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

					const template = await server.transformIndexHtml(
						url,
						await readIndexHtml(server.config.root)
					)
					const html = renderPageHtml(template, {
						content: render(pathname, islandUrl),
						page: pages[pathname],
						islandScript,
						styles: styles()
					})

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
