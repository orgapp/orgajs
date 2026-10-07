import { fileURLToPath } from 'node:url'
import { isRunnableDevEnvironment } from 'vite'
import { resolveEndpointResponse } from './endpoint.js'
import { readIndexHtml, renderPageHtml } from './html.js'

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

			server.middlewares.use(async (req, res, next) => {
				if (req.method !== 'GET' && req.method !== 'HEAD') {
					return next()
				}

				const url = req.url || '/'
				const pathname = url.split('?')[0]

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
						pathname,
						content: render(pathname),
						page: pages[pathname]
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
