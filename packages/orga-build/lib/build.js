import path from 'node:path'
import { createBuilder } from 'vite'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { emptyDir, ensureDir, exists } from './fs.js'
import fs from 'fs/promises'
import { createOrgaBuildConfig, alias } from './plugin.js'

// Re-export alias for backwards compatibility
export { alias }

const ssrEntry = fileURLToPath(new URL('./ssr.jsx', import.meta.url))
const clientEntry = fileURLToPath(new URL('./client.jsx', import.meta.url))
const defaultIndexHtml = fileURLToPath(new URL('./index.html', import.meta.url))

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
	const clientOutDir = outDir

	const { plugins, resolve } = createOrgaBuildConfig({
		root,
		outDir,
		containerClass,
		vitePlugins
	})

	// Shared config with environment-specific build settings
	const builder = await createBuilder({
		root,
		plugins,
		resolve,
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
					emptyOutDir: false,
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
	// Check for user's index.html in project root, otherwise use default
	const projectRoot = process.cwd()
	const userIndexPath = path.join(projectRoot, 'index.html')
	const indexHtmlPath = (await exists(userIndexPath)) ? userIndexPath : defaultIndexHtml
	const template = await fs.readFile(indexHtmlPath, { encoding: 'utf-8' })
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
