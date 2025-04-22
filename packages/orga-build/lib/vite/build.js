import path from 'node:path'
import { build as viteBuild } from 'vite'
import orga from '@orgajs/rollup'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { copy, emptyDir, ensureDir } from './fs.js'
import { pluginFactory } from './plugin.js'
import fs from 'fs/promises'

export async function build({ outDir = 'out' }) {
	/* --- prepare folders, out, ssr, client --- */
	const root = process.cwd()
	outDir = path.resolve(root, outDir)
	await emptyDir(outDir)
	const ssrOutDir = path.join(outDir, '.ssr')
	const clientOutDir = path.join(outDir, '.client')

	/* --- build ssr bundle: server.mjs --- */
	console.log('preparing ssr bundle...')
	const ssrOutput = await viteBuild({
		root,
		plugins: [orga(), react(), pluginFactory()],
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
		}
	})

	/* --- import ssr bundle entry output, to get all the data and render function --- */

	const { render, pages } = await import(pathToFileURL(path.join(ssrOutDir, 'ssr.mjs')).toString())

	/* --- build client bundle: client.mjs --- */
	const clientResult = await viteBuild({
		root,
		plugins: [orga(), react(), pluginFactory()],
		build: {
			cssCodeSplit: false,
			rollupOptions: {
				input: fileURLToPath(new URL('./client.jsx', import.meta.url)),
				preserveEntrySignatures: 'allow-extension'
			},
			assetsDir: 'assets',
			outDir: clientOutDir
		}
	})
	// console.log(clientResult)
	/* --- get from client bundle result: entry chunk, css chunks --- */
	const entryChunk = clientResult.output.filter(c => {
		return c.type === 'chunk' && c.isEntry
	})[0]
	/* --- get html template, inject entry js and css --- */
	const template = await fs.readFile(
		fileURLToPath(new URL('./index.html', import.meta.url)),
		{ encoding: 'utf-8' }
	)
	/* --- for each page path, render html using render function from ssr bundle, and inject the right css  --- */
	const pagePaths = Object.keys(pages)
	await Promise.all(pagePaths.map(async pagePath => {
		const html = renderHTML(pagePath)
		const writePath = path.join(
			clientOutDir,
			pagePath.replace(/^\//, ''),
			'index.html'
		)
		await ensureDir(path.dirname(writePath))
		await fs.writeFile(writePath, html)
		console.log(`wrote ${writePath}`)
	}))

	await copy(clientOutDir, outDir)
	await fs.rm(clientOutDir, { recursive: true })
	await fs.rm(ssrOutDir, { recursive: true })

	function renderHTML(pagePath) {
		const content = render(pagePath)
		const ssr = {
			routePath: pagePath
		}
		let html = template.replace('<div id="root"></div>', `
		<script>window._ssr=${JSON.stringify(ssr)};</script>
		<div id="root">${content}</div>
		`)
		html = html.replace(
			'<script type="module" src="/client.js"></script>',
			`<script type="module" src="/${entryChunk.fileName}"></script>`
		)
		return html
	}
}
