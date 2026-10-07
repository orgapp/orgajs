import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { devSsrPlugin } from './dev-ssr.js'
import { htmlShellPlugin } from './html.js'
import { setupOrga } from './orga.js'
import { prerenderPlugin } from './prerender.js'
import { pluginFactory } from './vite.js'

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))

const require = createRequire(import.meta.url)
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
 * @property {string[]} [styles] - Global stylesheet URLs to link from the HTML shell
 * @property {import('unified').PluggableList} [rehypePlugins] - Extra rehype plugins appended to orga-build defaults
 * @property {string[]} [exclude] - Glob patterns for files to exclude from content scanning
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
	exclude = []
}) {
	// Virtual modules import content files by path, so it must be absolute.
	root = path.resolve(root)
	return [
		configPlugin({ root, outDir }),
		htmlShellPlugin(styles),
		devSsrPlugin(),
		prerenderPlugin(),
		setupOrga({ containerClass, root, rehypePlugins }),
		react(),
		pluginFactory({ dir: root, outDir, exclude })
	]
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
						optimizeDeps: {
							// Scan pages, layouts and components up front so their deps
							// are pre-bundled at startup instead of triggering a reload
							// when first visited.
							entries: [
								'**/*.html',
								path.posix.join(contentDir, '**/*.{jsx,tsx}')
							],
							// The client entry lives in orga-build itself (in node_modules
							// once installed), which the scanner never crawls. Pre-bundle
							// its CJS deps explicitly or the browser gets raw CommonJS.
							include: [
								'react-dom/client',
								'orga-build > wouter > use-sync-external-store/shim/index.js'
							]
						}
					},
					ssr: {
						input: ssrEntry,
						// The built SSR bundle is self-contained so it can be imported
						// from outDir.
						resolve: isBuild ? { noExternal: true } : {},
						build: {
							outDir: path.join(clientOutDir, '.ssr'),
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
