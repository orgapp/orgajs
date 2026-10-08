import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { devSsrPlugin } from './dev-ssr.js'
import { htmlShellPlugin } from './html.js'
import { islandPlugin } from './island.js'
import { setupOrga } from './orga.js'
import { prerenderPlugin } from './prerender.js'
import { pluginFactory } from './vite.js'

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))
/**
 * Prefix of emitted asset paths in server-rendered markup, replaced per page
 * while prerendering (see `prerender.js`).
 */
export const assetUrlMarker = '/@orga-build/asset/'

const require = createRequire(import.meta.url)
/**
 * Alias map for React to ensure a single copy is bundled
 */
export const alias = {
	react: path.dirname(require.resolve('react/package.json')),
	'react-dom': path.dirname(require.resolve('react-dom/package.json'))
}

/**
 * @typedef {Object} OrgaBuildPluginOptions
 * @property {string} root - Root directory for content files
 * @property {string | undefined} [outDir] - Output directory (default: Vite's `build.outDir`)
 * @property {string|string[]} [containerClass] - CSS class(es) to wrap rendered content
 * @property {string[]} [styles] - Global stylesheet URLs to link from the HTML shell
 * @property {import('unified').PluggableList} [rehypePlugins] - Extra rehype plugins appended to orga-build defaults
 * @property {string[]} [exclude] - Glob patterns for files to exclude from content scanning
 * @property {string | undefined} [site] - Absolute URL the site is served from, e.g. `https://example.com`
 */

/**
 * Creates the orga-build plugin preset: everything needed for `vite` (dev SSR)
 * and `vite build` (static site) to work, used by the CLI and usable directly
 * in a `vite.config.js`.
 *
 * @param {OrgaBuildPluginOptions} options
 * @returns {import('vite').PluginOption[]}
 */
export function orgaBuildPlugin({
	root,
	outDir,
	containerClass = [],
	styles = [],
	rehypePlugins = [],
	exclude = [],
	site
}) {
	// Virtual modules import content files by path, so it must be absolute.
	root = path.resolve(root)
	site = normalizeSite(site)
	const islands = islandPlugin()
	return [
		configPlugin({ root, outDir }),
		htmlShellPlugin(styles),
		devSsrPlugin(site),
		prerenderPlugin(islands, site),
		islands,
		setupOrga({ containerClass, root, rehypePlugins }),
		react(),
		pluginFactory({ dir: root, exclude, site })
	]
}

/**
 * Without a trailing slash, so `site + page.slug` is a page's URL.
 * @param {string | undefined} site
 */
function normalizeSite(site) {
	if (site === undefined) return
	if (!URL.canParse(site)) {
		throw new Error(
			`orga-build: "site" must be an absolute URL, e.g. "https://example.com", got "${site}"`
		)
	}
	return new URL(site).href.replace(/\/+$/, '')
}

/**
 * Creates the full Vite config options for orga-build.
 *
 * @param {OrgaBuildPluginOptions & { vitePlugins?: import('vite').PluginOption[] }} options
 * @returns {{ plugins: import('vite').PluginOption[] }}
 */
export function createOrgaBuildConfig({ vitePlugins = [], ...options }) {
	return {
		plugins: [...vitePlugins, ...orgaBuildPlugin(options)]
	}
}

/**
 * @param {Object} options
 * @param {string} options.root - Content root
 * @param {string | undefined} options.outDir
 * @returns {import('vite').Plugin}
 */
function configPlugin({ root, outDir }) {
	return {
		name: 'orga-build:config',
		config(config, { command }) {
			const clientOutDir = outDir ?? config.build?.outDir ?? 'dist'
			const isBuild = command === 'build'
			const contentDir = path
				.relative(path.resolve(config.root ?? ''), path.resolve(root))
				.split(path.sep)
				.join('/')
			return {
				// HTML is served by orga-build:dev-ssr, not Vite's SPA fallback.
				appType: 'custom',
				// Asset URLs in server-rendered markup are resolved per page while
				// prerendering, so a relative `base` works for nested pages. Left
				// alone when the user renders URLs themselves.
				experimental: config.experimental?.renderBuiltUrl
					? {}
					: {
							renderBuiltUrl(filename, { hostType, ssr }) {
								if (ssr && hostType === 'js') return assetUrlMarker + filename
							}
						},
				// Make `vite build` build every environment through buildApp.
				builder: {},
				// `resolve.alias` is global, not per-environment, so it is only set
				// for build. In dev it would also reach the SSR module runner: the
				// aliases turn bare specifiers (e.g. 'react') into absolute paths,
				// which bypasses Vite's externalization and evaluates CJS packages
				// inline, without 'module'/'require' globals.
				resolve: isBuild ? { alias } : {},
				build: {
					outDir: clientOutDir,
					// Also tells Vite to stop watching outDir in dev.
					emptyOutDir: true,
					cssCodeSplit: false
				},
				server: { forwardConsole: true },
				environments: {
					client: {
						input: 'index.html',
						// Islands are extra client chunks; prerendering reads their
						// hashed names from the manifest.
						build: { manifest: true },
						optimizeDeps: {
							// Scan pages, layouts and components up front so their deps
							// are pre-bundled at startup instead of triggering a reload
							// when first visited.
							entries: [
								'**/*.html',
								path.posix.join(contentDir, '**/*.{jsx,tsx}')
							],
							// The island runtime lives in orga-build itself (in
							// node_modules once installed), which the scanner never
							// crawls. Pre-bundle its CJS deps explicitly or the browser
							// gets raw CommonJS.
							include: ['react', 'react-dom/client']
						}
					},
					ssr: {
						input: ssrEntry,
						// The built SSR bundle is self-contained so it can be imported
						// from its outDir, which sits outside the site's outDir because
						// it must survive the client build.
						resolve: isBuild ? { noExternal: true } : {},
						build: {
							outDir: path.join(
								path.resolve(config.root ?? ''),
								'node_modules/.orga-build/ssr'
							),
							// Pages live only in this graph now, so their images and CSS
							// must be emitted here; prerendering copies them to the site.
							emitAssets: true,
							minify: false,
							rolldownOptions: {
								output: {
									entryFileNames: '[name].mjs',
									chunkFileNames: '[name]-[hash].mjs'
								}
							}
						}
					}
				}
			}
		}
	}
}
