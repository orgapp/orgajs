import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { normalizePath } from 'vite'
import { resolveEndpointResponse } from './endpoint.js'
import { ensureDir } from './fs.js'
import { renderPageHtml } from './html.js'
import { clientRuntime } from './island.js'
import { assetUrlMarker } from './plugin.js'

/**
 * Turns `vite build` into a static site build: builds the SSR and client
 * environments, then renders every page and endpoint into the client outDir.
 *
 * @param {import('vite').Plugin} islands - The island plugin, whose `api`
 *   tells whether the client build ran before islands were discovered
 * @returns {import('vite').Plugin}
 */
export function prerenderPlugin(islands) {
	return {
		name: 'orga-build:prerender',

		buildApp: {
			// Run after any configured `builder.buildApp`: a client build empties
			// outDir, so prerendered files must be written last.
			order: 'post',
			async handler(builder) {
				const { client, ssr } = builder.environments
				// Islands are discovered while building `ssr`, so it goes first. A
				// client built earlier (e.g. by another plugin's buildApp) lacks them.
				if (!ssr.isBuilt) await builder.build(ssr)
				if (!client.isBuilt || islands.api?.clientIsStale) {
					await builder.build(client)
				}
				await prerender(client, ssr, islands)
			}
		}
	}
}

/**
 * @param {import('vite').BuildEnvironment} client
 * @param {import('vite').BuildEnvironment} ssr
 * @param {import('vite').Plugin} islands - Its `api.ssrAssets` lists the files the SSR build emitted
 */
async function prerender(client, ssr, islands) {
	const outDir = resolveOutDir(client)
	const ssrOutDir = resolveOutDir(ssr)
	const { root, base } = client.config

	// Images and CSS imported by pages are emitted by the SSR build next to its
	// bundle: move them into the site and link the CSS (one file, see
	// `cssCodeSplit`).
	/** @type {string[]} */
	const emitted = [.../** @type {Set<string>} */ (islands.api?.ssrAssets ?? [])]
	await Promise.all(
		emitted.map(async (file) => {
			await ensureDir(path.dirname(path.join(outDir, file)))
			await fs.copyFile(path.join(ssrOutDir, file), path.join(outDir, file))
		})
	)
	const styles = emitted.filter((file) => file.endsWith('.css'))

	/**
	 * URL of a file in outDir from a page `depth` directories deep. With a
	 * relative `base`, URLs are relative to the page's directory.
	 * @param {number} depth
	 */
	const urlAt =
		(depth) =>
		/** @param {string} file */
		(file) =>
			base === './'
				? `${depth ? '../'.repeat(depth) : './'}${file}`
				: base + file

	// Cache-bust so repeated builds in one process load the fresh bundle.
	const ssrModuleUrl = pathToFileURL(path.join(ssrOutDir, 'ssr.mjs'))
	ssrModuleUrl.search = `t=${Date.now()}`
	const { render, pages, endpoints = {} } = await import(ssrModuleUrl.href)

	// Vite has processed index.html into the shell: stylesheets are already
	// injected with their hashed names.
	const shellPath = path.join(outDir, 'index.html')
	const template = await fs.readFile(shellPath, 'utf-8')
	if (!pages['/']) await fs.rm(shellPath)

	// Islands are built as extra client chunks; the manifest has their names.
	/** @type {Record<string, { file: string }>} */
	const manifest = JSON.parse(
		await fs.readFile(path.join(outDir, '.vite/manifest.json'), 'utf-8')
	)
	const runtimeSrc = normalizePath(path.relative(root, clientRuntime))

	await Promise.all(
		Object.keys(pages).map(async (pathname) => {
			const toUrl = urlAt(pathname.split('/').filter(Boolean).length)
			/** @param {string} src */
			const url = (src) => {
				const file = manifest[src]?.file
				if (!file) {
					throw new Error(
						`island "${src}" is missing from the client build: the client environment must be built after ssr`
					)
				}
				return toUrl(file)
			}
			const html = renderPageHtml(rebaseRelativeUrls(template, pathname), {
				// Emitted assets are marked in the markup (see `renderBuiltUrl`).
				content: render(pathname, url)?.replaceAll(assetUrlMarker, toUrl('')),
				page: pages[pathname],
				islandScript: manifest[runtimeSrc] && url(runtimeSrc),
				styles: styles.map(toUrl)
			})
			const writePath = path.join(
				outDir,
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

			// Responses may carry emitted asset URLs too (see `renderBuiltUrl`).
			// The marker is ASCII, so the substitution is done on a byte-preserving
			// latin1 view: any charset survives, and untouched bodies stay as is.
			let body = Buffer.from(await response.arrayBuffer())
			if (body.includes(assetUrlMarker)) {
				const toUrl = urlAt(route.split('/').filter(Boolean).length - 1)
				body = Buffer.from(
					body.toString('latin1').replaceAll(assetUrlMarker, toUrl('')),
					'latin1'
				)
			}
			const writePath = path.join(outDir, route.replace(/^\//, ''))
			await ensureDir(path.dirname(writePath))
			await fs.writeFile(writePath, body)
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
