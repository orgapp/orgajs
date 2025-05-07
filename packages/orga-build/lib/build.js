import path from 'node:path'
import { build as viteBuild } from 'vite'
import orga from '@orgajs/rollup'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { copy, emptyDir, ensureDir } from './fs.js'
import { pluginFactory } from './vite.js'
import fs from 'fs/promises'
import assert from 'node:assert'
import { rehypeWrap } from './plugins.js'

/**
 * @param {import('./config.js').Config} config
 */
export async function build({
	outDir,
	root,
	containerClass,
	vitePlugins = []
}) {
	/* --- prepare folders, out, ssr, client --- */
	await emptyDir(outDir)
	const ssrOutDir = path.join(outDir, '.ssr')
	const clientOutDir = path.join(outDir, '.client')

	const plugins = [
		orga({
			rehypePlugins: [[rehypeWrap, { className: containerClass }]]
		}),
		react(),
		pluginFactory({ dir: root }),
		...vitePlugins
	]

	/* --- build ssr bundle: server.mjs --- */
	console.log('preparing ssr bundle...')
	await viteBuild({
		root,
		plugins,
		build: {
			ssr: true,
			cssCodeSplit: false,
			rollupOptions: {
				input: fileURLToPath(new URL('./ssr.jsx', import.meta.url)),
				output: {
					entryFileNames: '[name].mjs',
					chunkFileNames: '[name]-[hash].mjs'
				}
			},
			outDir: ssrOutDir,
			minify: false
		},
		ssr: {
			noExternal: true
		}
	})

	/* --- import ssr bundle entry output, to get all the data and render function --- */

	const { render, pages } = await import(
		pathToFileURL(path.join(ssrOutDir, 'ssr.mjs')).toString()
	)

	/* --- build client bundle: client.mjs --- */
	const _clientResult = await viteBuild({
		root,
		plugins,
		build: {
			cssCodeSplit: false,
			rollupOptions: {
				input: fileURLToPath(new URL('./client.jsx', import.meta.url)),
				preserveEntrySignatures: 'allow-extension'
			},
			assetsDir: 'assets',
			outDir: clientOutDir
		},
		ssr: {
			noExternal: true
		}
	})

	/** @type {import('vite').Rollup.RollupOutput} */
	let clientResult
	if (Array.isArray(_clientResult)) {
		if (_clientResult.length !== 1)
			throw new Error(`expect viteBuild to have only one BuildResult`)
		clientResult = _clientResult[0]
	} else {
		assert('output' in _clientResult)
		clientResult = _clientResult
	}

	/* --- get from client bundle result: entry chunk, css chunks --- */
	const entryChunk = clientResult.output.filter((c) => {
		return c.type === 'chunk' && c.isEntry
	})[0]

	const cssChunks = clientResult.output.filter((c) => {
		return c.type === 'asset' && c.fileName.endsWith('.css')
	})

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
			.map((c) => `<link rel="stylesheet" href="/${c.fileName}">`)
			.join('\n')
		html = html.replace(
			'<script type="module" src="/@orga-build/main.js"></script>',
			`<script type="module" src="/${entryChunk.fileName}"></script>`
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
