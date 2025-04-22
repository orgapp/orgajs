import orgaRollup from '@orgajs/rollup'
import react from '@vitejs/plugin-react'
import { promises as fs } from 'fs'
import { globby } from 'globby'
import path from 'path'
import { build as viteBuild } from 'vite'

/**
 * @param {import('../config.js').Config} options
 */
export async function build({ outDir = 'out', preBuild = [], postBuild = [] }) {
	// Execute pre-build hooks
	// for (const hook of preBuild) {
	//   await hook();
	// }

	// Find all page files (.org, .tsx, .jsx)
	// Ignore files starting with . or _, also ignore node_modules and out directory
	const files = await globby([
		'**/*.{org,tsx,jsx}',
		'!**/_*/**',
		'!**/_*',
		'!**/.*/**',
		'!**/.*',
		'!node_modules/**',
		'!out/**'
	])

	// Check for _components.tsx or _components.jsx file
	const componentFiles = await globby(['_components.tsx', '_components.jsx'])
	const hasComponentsFile = componentFiles.length > 0
	const componentsFilePath = hasComponentsFile
		? path.resolve(componentFiles[0])
		: null

	console.log(
		hasComponentsFile
			? `Found components file: ${componentsFilePath}`
			: 'No components file found'
	)

	// Create directory if it doesn't exist
	await fs.mkdir(outDir, { recursive: true })

	// Create temp directories for SSR
	const ssrDir = path.join(outDir, '_temp_ssr')
	const entriesDir = path.join(outDir, '_temp_entries')
	await fs.mkdir(ssrDir, { recursive: true })
	await fs.mkdir(entriesDir, { recursive: true })

	/** @type {Object.<string, string>} - Map of entry point names to file paths */
	const clientEntries = {}
	/** @type {Object.<string, string>} - Map of SSR entry point names to file paths */
	const ssrEntries = {}

	for (const file of files) {
		const fileBaseName = path.basename(file, path.extname(file))
		const relativePath = file.replace(/\.(org|tsx|jsx)$/, '')

		// Generate entry file for client hydration
		const clientEntry = path.join(entriesDir, `${relativePath}.client.jsx`)
		await fs.mkdir(path.dirname(clientEntry), { recursive: true })

		const clientEntryContent = generateClientEntry(file, componentsFilePath)

		await fs.writeFile(clientEntry, clientEntryContent)
		clientEntries[relativePath] = clientEntry

		// Generate entry file for SSR
		const ssrEntry = path.join(entriesDir, `${relativePath}.server.jsx`)
		await fs.mkdir(path.dirname(ssrEntry), { recursive: true })

		const ssrEntryContent = generateSSREntry(file, componentsFilePath)

		await fs.writeFile(ssrEntry, ssrEntryContent)
		ssrEntries[relativePath] = ssrEntry
	}

	// Client build config
	// First, build the client-side bundle
	console.log('Building client bundle...')

	// Build client bundle
	await viteBuild({
		plugins: [orgaRollup(), react()],
		build: {
			outDir: path.join(outDir, 'assets'),
			emptyOutDir: true,
			rollupOptions: {
				input: clientEntries, // Rollup will handle this object format
				output: {
					entryFileNames: '[name].[hash].js',
					chunkFileNames: 'chunks/[name].[hash].js'
				}
			},
			cssCodeSplit: true,
			minify: true,
			manifest: true // Generate manifest.json for asset mapping
		}
	})

	// Read the manifest to map routes to assets
	const manifest = JSON.parse(
		await fs.readFile(
			path.join(outDir, 'assets', '.vite', 'manifest.json'),
			'utf-8'
		)
	)

	console.log('Manifest:', manifest)

	// Now build SSR bundle for HTML generation
	console.log('Building SSR bundle...')

	// Build SSR bundle
	await viteBuild({
		plugins: [orgaRollup(), react()],
		build: {
			outDir: ssrDir,
			ssr: true,
			rollupOptions: {
				input: ssrEntries, // Rollup will handle this object format
				output: {
					format: 'esm',
					entryFileNames: '[name].js'
				}
			}
		}
	})

	// Generate HTML files using SSR output
	console.log('Generating static HTML...')
	for (const file of files) {
		const fileBaseName = path.basename(file, path.extname(file))
		const relativePath = file.replace(/\.(org|tsx|jsx)$/, '')

		// Determine output HTML path
		const htmlOutput = path.join(
			outDir,
			relativePath === 'index' ? 'index.html' : `${relativePath}/index.html`
		)
		await fs.mkdir(path.dirname(htmlOutput), { recursive: true })

		// Import the SSR module
		const ssrModule = await import(
			`file://${path.resolve(ssrDir, `${relativePath}.js`)}?t=${Date.now()}`
		)
		const renderedContent = ssrModule.render()

		// Find the right entry in the manifest
		const entryKey = `${outDir}/_temp_entries/${relativePath}.client.jsx`
		const entryAsset = manifest[entryKey]

		console.log(`Looking for manifest entry with key: ${entryKey}`)

		let entryScript = ''
		let cssAssets = []

		if (entryAsset) {
			console.log(`Found entry asset: ${JSON.stringify(entryAsset)}`)
			entryScript = entryAsset.file
			cssAssets = entryAsset.css || []
		} else {
			// Try to find by matching the relative path
			console.warn(`No direct match for ${entryKey}, searching...`)

			const possibleKey = Object.keys(manifest).find((key) =>
				key.includes(`/${relativePath}.client.jsx`)
			)

			if (possibleKey) {
				console.log(`Found alternative key: ${possibleKey}`)
				entryScript = manifest[possibleKey].file
				cssAssets = manifest[possibleKey].css || []
			} else {
				console.warn(`Could not find entry for ${relativePath} in manifest`)
			}
		}

		// Generate HTML with SSR content and hydration scripts
		const htmlContent = generateHtml({
			title: ssrModule.title,
			content: renderedContent,
			css: cssAssets,
			js: [entryScript]
		})
		await fs.writeFile(htmlOutput, htmlContent)
	}

	// Clean up temp directories
	await fs.rm(ssrDir, { recursive: true, force: true })
	await fs.rm(entriesDir, { recursive: true, force: true })

	// Execute post-build hooks
	// for (const hook of postBuild) {
	//   await hook();
	// }

	console.log(`Build completed. Output directory: ${outDir}`)
}

/**
 * @param {string} file
 * @param {string | null} components
 */
function generateClientEntry(file, components) {
	let imports = `
		import React from 'react';
		import ReactDOM from 'react-dom/client';
		import Page from '${path.resolve(file)}';
	`

	let render = 'React.createElement(Page)'
	if (components !== null) {
		imports += `import * as components from '${components}';`
		render = 'React.createElement(Page, { components })'
	}

	return `
${imports}

window.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.hydrateRoot(document.getElementById('app'), ${render});
});
`
}

/**
 * @param {string} file
 * @param {string | null} components
 */
function generateSSREntry(file, components) {
	let imports = `
		import React from 'react';
	  import { renderToString } from 'react-dom/server';
		import {default as Page, title} from '${path.resolve(file)}';
	`

	let render = 'React.createElement(Page)'
	if (components !== null) {
		imports += `import * as components from '${components}';`
		render = 'React.createElement(Page, { components })'
	}

	return `
${imports}

export function render() {
  return renderToString(${render});
}

export { title }

`
}

/**
 * @typedef {Object} HtmlOptions
 * @property {string} title
 * @property {string} content
 * @property {string[]} css
 * @property {string[]} js
 * @param {HtmlOptions} js
 */
function generateHtml({ title, content, css, js }) {
	const cssLinks = css.map((p) => `<link rel="stylesheet" href="/assets/${p}">`)
	const jsRefs = js.map(
		(p) => `<script type="module" src="/assets/${p}"></script>`
	)
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${cssLinks.join('\n')}
</head>
<body>
  <div id="app">${content}</div>
  ${jsRefs.join('\n')}
</body>
</html>`
}

/**
 * @param {import("fs").PathLike} dir
 */
export async function clean(dir) {
	await fs.rm(dir, { recursive: true })
}
