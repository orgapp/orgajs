import path from 'node:path'
import { createRequire } from 'node:module'
import { createBuilder } from 'vite'
import { setupOrga } from './orga.js'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { copy, emptyDir, ensureDir } from './fs.js'
import { pluginFactory } from './vite.js'
import fs from 'fs/promises'

const require = createRequire(import.meta.url)

export const alias = {
	react: path.dirname(require.resolve('react/package.json')),
	'react-dom': path.dirname(require.resolve('react-dom/package.json')),
	wouter: path.dirname(require.resolve('wouter'))
}

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))
const clientEntry = fileURLToPath(new URL('./client.jsx', import.meta.url))

/**
 * @param {import('./config.js').Config} config
 */
export async function build({
	outDir,
	root,
	containerClass,
	vitePlugins = []
}) {
	await emptyDir(outDir)
	const ssrOutDir = path.join(outDir, '.ssr')
	const clientOutDir = path.join(outDir, '.client')

	const plugins = [
		setupOrga({ containerClass }),
		react(),
		pluginFactory({ dir: root }),
		...vitePlugins
	]

	// Shared config with environment-specific build settings
	const builder = await createBuilder({
		root,
		plugins,
		resolve: { alias },
		ssr: { noExternal: true },
		environments: {
			ssr: {
				build: {
					ssr: true,
					outDir: ssrOutDir,
					cssCodeSplit: false,
					emptyOutDir: true,
					minify: false,
					rollupOptions: {
						input: ssrEntry,
						output: {
							entryFileNames: '[name].mjs',
							chunkFileNames: '[name]-[hash].mjs'
						}
					}
				}
			},
			client: {
				build: {
					outDir: clientOutDir,
					cssCodeSplit: false,
					emptyOutDir: true,
					assetsDir: 'assets',
					rollupOptions: {
						input: clientEntry,
						preserveEntrySignatures: 'allow-extension'
					}
				}
			}
		}
	})

	// Build SSR first to get render function and pages
	console.log('preparing ssr bundle...')
	await builder.build(builder.environments.ssr)

	const { render, pages } = await import(
		pathToFileURL(path.join(ssrOutDir, 'ssr.mjs')).toString()
	)

	// Build client bundle
	const _clientResult = await builder.build(builder.environments.client)

	// Normalize build result to single RollupOutput
	const clientOutput = Array.isArray(_clientResult)
		? _clientResult[0].output
		: 'output' in _clientResult
			? _clientResult.output
			: null
	if (!clientOutput) throw new Error('Unexpected client build result')

	/* --- get from client bundle result: entry chunk, css chunks --- */
	const entryChunk = clientOutput.find(
		(/** @type {any} */ c) => c.type === 'chunk' && c.isEntry
	)

	const cssChunks = clientOutput.filter(
		(/** @type {any} */ c) => c.type === 'asset' && c.fileName.endsWith('.css')
	)

	/* --- get html template, inject entry js and css --- */
	const template = await fs.readFile(
		fileURLToPath(new URL('./index.html', import.meta.url)),
		{ encoding: 'utf-8' }
	)
	/* --- for each page path, render html using render function from ssr bundle, and inject the right css  --- */
	const pagePaths = Object.keys(pages)
	await Promise.all(
		pagePaths.map(async (pagePath) => {
			const html = renderHTML(pagePath)
			const writePath = path.join(
				clientOutDir,
				pagePath.replace(/^\//, ''),
				'index.html'
			)
			await ensureDir(path.dirname(writePath))
			await fs.writeFile(writePath, html)
		})
	)

	await copy(clientOutDir, outDir)
	await fs.rm(clientOutDir, { recursive: true })
	await fs.rm(ssrOutDir, { recursive: true })

	return

	// ---------- the end ----------

	/**
	 * @param {string} pagePath
	 */
	function renderHTML(pagePath) {
		const content = render(pagePath)
		const ssr = {
			routePath: pagePath
		}
		let html = template.replace(
			'<div id="root"></div>',
			`
		<script>window._ssr=${JSON.stringify(ssr)};</script>
		<div id="root">${content}</div>
		`
		)
		const css = cssChunks
			.map((/** @type {any} */ c) => `<link rel="stylesheet" href="/${c.fileName}">`)
			.join('\n')
		html = html.replace(
			'<script type="module" src="/@orga-build/main.js"></script>',
			`<script type="module" src="/${entryChunk?.fileName}"></script>`
		)

		html = html.replace('</head>', `${css}</head>`)

		const page = pages[pagePath]
		if (page && page.title) {
			html = html.replace(
				/<title>(.*?)<\/title>/,
				`<title>${page.title}</title>`
			)
		}

		return html
	}
}
