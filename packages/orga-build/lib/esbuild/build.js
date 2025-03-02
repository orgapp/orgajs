import fs from 'node:fs/promises'
import * as esbuild from 'esbuild'
import esbuildOrga from '@orgajs/esbuild'
import path from 'node:path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import assert from 'node:assert'
import { DefaultLayout, $, match } from '../util.js'
import rawLoader from './raw-loader.js'
import resolveReact from './resolve-react.js'

/**
 * @param {import('../config.js').Config} options
 */
export async function build({ outDir = 'dir', preBuild = [], postBuild = [] }) {
	for (const cmd of preBuild) {
		console.log(`Running pre-build command: ${cmd}`)
		await $(cmd)
	}
	const cwd = process.cwd()
	const start = performance.now()

	const src = {
		/** @type {string[]} */
		layouts: [],
		/** @type {string[]} */
		components: [],
		/** @type {string[]} */
		pages: []
	}

	await walk(cwd, (file) => {
		const fileName = path.basename(file)
		if (match(fileName, /(.|_)layout.(j|t)sx$/)) {
			src.layouts.push(file)
			return
		}
		if (match(fileName, /(.|_)components.(j|t)sx$/)) {
			src.components.push(file)
			return
		}
		if (match(fileName, /\.(org)$/, /\.(j|t)sx$/)) {
			src.pages.push(file)
			return
		}
	})

	const result = await esbuild.build({
		entryPoints: [
			...Object.values(src.layouts),
			...src.components,
			...src.pages
		],
		// entryNames: '[dir]/_/[name]',
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'esnext',
		// jsxFactory: 'React.createElement',
		// jsxFragment: 'React.Fragment',
		jsx: 'automatic',
		// write: false,
		outdir: '.orga-build/js',
		// splitting: true,
		metafile: true,
		plugins: [
			esbuildOrga({
				reorgRehypeOptions: {
					linkHref: (link) => {
						if (link.path.protocol === 'file') {
							return link.path.value.replace(/\.org$/, '.html')
						}
						return link.path.value
					}
				}
				// reorgPlugins: [reorgLinks]
			}),
			rawLoader,
			resolveReact
		],
		// external: ['react/jsx-runtime'],
		loader: {
			'.jsx': 'jsx',
			'.tsx': 'tsx'
		}
	})

	assert(result.metafile, 'metafile not found')

	let components = {}

	/**
	 * @typedef {Object} DirInfo
	 * @property {string|undefined} layout
	 * @property {PageInfo[]} pages

	 * @typedef {Object} PageInfo
	 * @property {Record<string, any>} metadata
	 * @property {import('react').ComponentType<any>} Content
	 * @property {string} src
	 * @property {string} file
	 */

	/** @type {Record<string, DirInfo>} */
	let map = {}
	// iterate over results to get layout and components
	for (const [file, meta] of Object.entries(result.metafile.outputs)) {
		if (!meta.entryPoint) continue
		const fullSrc = path.join(cwd, meta.entryPoint)
		// get components
		if (src.components.includes(fullSrc)) {
			const module = await import(path.join(cwd, file))
			components = { ...components, ...module }
			continue
		}

		const dirPath = path.dirname(fullSrc)
		map[dirPath] = map[dirPath] ?? {
			layout: undefined,
			pages: []
		}
		const dir = map[dirPath]

		// get layouts
		if (src.layouts.includes(fullSrc)) {
			dir.layout = path.join(cwd, file)
			continue
		}
		if (src.pages.includes(fullSrc)) {
			const fullPath = path.join(cwd, file)
			const { default: Content, ...metadata } = await import(fullPath)
			dir.pages.push({
				metadata: {
					...metadata,
					slug: `/${meta.entryPoint.replace(/\.\w+$/, '.html')}`
				},
				Content,
				src: fullSrc,
				file: fullPath
			})
		}
	}

	for (const [, content] of Object.entries(map)) {
		for (const page of content.pages) {
			const Layout = await getLayout(page.src)
			const e = createElement(
				Layout ?? DefaultLayout,
				{ ...page.metadata, pages: content.pages.map((p) => p.metadata) },
				createElement(page.Content, { components })
			)
			const html = renderToString(e)
			// write to outDir/file
			const relPath = path.relative(cwd, page.src)
			const outPath = path.join(outDir, relPath)
			const outDirPath = path.dirname(outPath)
			await fs.mkdir(outDirPath, { recursive: true })
			await fs
				.writeFile(outPath.replace(/\.(org|jsx|tsx)$/, '.html'), html)
				.catch(console.error)
		}
	}

	for (const cmd of postBuild) {
		console.log(`Running post-build command: ${cmd}`)
		await $(cmd)
	}

	const end = performance.now()
	console.log(`Built in ${(end - start).toFixed(2)}ms`)

	/**
	 * @param {string} file
	 * @returns {Promise<import('react').ComponentType<any>|undefined>}
	 */
	async function getLayout(file) {
		if (file === cwd) return
		const dir = path.dirname(file)
		const ParentLayout = await getLayout(dir)
		const { layout } = map[dir]
		if (layout) {
			const Layout = (await import(layout)).default
			if (ParentLayout) {
				return function (props) {
					return createElement(
						ParentLayout,
						props,
						createElement(Layout, props)
					)
				}
			}
			return Layout
		}
		return ParentLayout
	}
}

/**
 * Iterates over files in a directory recursively in a breadth-first manner.
 * @param {string} dirPath - The path to the directory.
 * @param {(file: string) => void} callback - The callback function to be called for each file.
 */
async function walk(dirPath, callback) {
	const queue = [dirPath]

	const ignore = [/^\./, /node_modules/]

	while (queue.length > 0) {
		const currentPath = queue.shift()
		if (!currentPath) break
		const files = await fs.readdir(currentPath)

		for (const file of files) {
			if (match(file, ...ignore)) {
				continue
			}
			const filePath = path.join(currentPath, file)
			const stats = await fs.stat(filePath)

			if (stats.isDirectory()) {
				queue.push(filePath)
			} else {
				callback(filePath)
			}
		}
	}
}

/**
 * @param {import("fs").PathLike} dir
 */
export async function clean(dir) {
	await fs.rm(dir, { recursive: true })
}
