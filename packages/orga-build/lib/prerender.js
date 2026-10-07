import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveEndpointResponse } from './endpoint.js'
import { ensureDir, exists } from './fs.js'
import { renderPageHtml } from './html.js'

/**
 * Turns `vite build` into a static site build: builds the client and SSR
 * environments, then renders every page and endpoint into the client outDir.
 *
 * @returns {import('vite').Plugin}
 */
export function prerenderPlugin() {
	return {
		name: 'orga-build:prerender',

		buildApp: {
			// Run after any configured `builder.buildApp`: a client build empties
			// outDir, so prerendered files must be written last.
			order: 'post',
			async handler(builder) {
				const { client, ssr } = builder.environments
				const clientOutDir = resolveOutDir(client)
				const ssrOutDir = resolveOutDir(ssr)
				const ssrBundle = path.join(ssrOutDir, 'ssr.mjs')

				// Client first: it empties outDir, which contains the SSR outDir.
				if (!client.isBuilt) await builder.build(client)
				// A client build after the SSR build has deleted the SSR bundle.
				if (!ssr.isBuilt || !(await exists(ssrBundle))) await builder.build(ssr)

				await prerender(clientOutDir, ssrBundle)
				await fs.rm(ssrOutDir, { recursive: true })
			}
		}
	}
}

/**
 * @param {string} clientOutDir
 * @param {string} ssrBundle
 */
async function prerender(clientOutDir, ssrBundle) {
	// Cache-bust so repeated builds in one process load the fresh bundle.
	const ssrModuleUrl = pathToFileURL(ssrBundle)
	ssrModuleUrl.search = `t=${Date.now()}`
	const { render, pages, endpoints = {} } = await import(ssrModuleUrl.href)

	// Vite has processed index.html into the shell: entry script and
	// stylesheets are already injected with their hashed names.
	const shellPath = path.join(clientOutDir, 'index.html')
	const template = await fs.readFile(shellPath, 'utf-8')
	if (!pages['/']) await fs.rm(shellPath)

	await Promise.all(
		Object.keys(pages).map(async (pathname) => {
			const html = renderPageHtml(rebaseRelativeUrls(template, pathname), {
				pathname,
				content: render(pathname),
				page: pages[pathname]
			})
			const writePath = path.join(
				clientOutDir,
				pathname.replace(/^\//, ''),
				'index.html'
			)
			await ensureDir(path.dirname(writePath))
			await fs.writeFile(writePath, html)
		})
	)

	await Promise.all(
		Object.keys(endpoints).map(async (route) => {
			const ctx = {
				url: new URL(`http://localhost${route}`),
				params: {},
				mode: /** @type {'build'} */ ('build'),
				route: { route }
			}

			const response = await resolveEndpointResponse(
				endpoints[route],
				ctx,
				'GET'
			)
			if (response.status < 200 || response.status >= 300) {
				throw new Error(
					`Endpoint route "${route}" returned non-2xx status during build: ${response.status}`
				)
			}

			const writePath = path.join(clientOutDir, route.replace(/^\//, ''))
			await ensureDir(path.dirname(writePath))
			await fs.writeFile(writePath, Buffer.from(await response.arrayBuffer()))
		})
	)
}

/**
 * With a relative `base`, Vite writes the shell's URLs relative to the root
 * `index.html` (`./assets/…`). Rebase them for pages in nested directories.
 *
 * @param {string} html
 * @param {string} pathname
 */
function rebaseRelativeUrls(html, pathname) {
	const depth = pathname.split('/').filter(Boolean).length
	if (!depth) return html
	return html.replace(/(\s(?:src|href)=["'])\.\//g, `$1${'../'.repeat(depth)}`)
}

/**
 * @param {import('vite').BuildEnvironment} environment
 */
function resolveOutDir(environment) {
	return path.resolve(environment.config.root, environment.config.build.outDir)
}
