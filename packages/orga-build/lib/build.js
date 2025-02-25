import { globby } from 'globby'
import fs from 'node:fs/promises'
import { register } from 'node:module'
import path from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import assert from 'node:assert'
import { match } from './util.js'
import { evaluate, build as _build } from './esbuild.js'
import { $, DefaultLayout } from './util.js'

const USE_NODE = false

if (USE_NODE) {
	register('./jsx-loader.js', import.meta.url)
	register('./orga-loader.js', import.meta.url)
	register('./raw-loader.js', import.meta.url)
}

const defaultConfig = {
	outDir: 'out',
	/** @type {string[]} */
	preBuild: [],
	/** @type {string[]} */
	postBuild: []
}

/**
 * @typedef {Object} Page
 * @property {import('@orgajs/orgx').OrgContent} Content
 * @property {Record<string, any>} metadata - The metadata from the org file export, will be passed to the Layout component
 * @property {string} src - The absolute path to the org file
 * @property {string} slug - The slug for the page
 */

/**
 * @typedef {import('react').ComponentType<any>} Layout
 */

/**
 * @typedef {string | RegExp} Pattern
 */

/**
 * @typedef {Object} BuildContext
 * @property {import('@orgajs/orgx').OrgComponents} [components] - The components from the org file
 * @property {Layout | undefined} [Layout] - The layout component
 * @property {Pattern | Pattern[]} [ignore] - The ignore pattern
 * @property {(page: Page & { Layout?: Layout | undefined, components: Record<string, any> }) => Promise<void>} build - The build function
 * @property {(filePath: string, metadata: Record<string, any>) => string} buildHref - The build function
 */

/**
 * Recursively processes a directory to build pages from .org files
 * @param {string} dirPath - The directory path to process
 * @param {BuildContext} context - Build context containing components, layout, and build function
 * @returns {Promise<void>}
 */
async function iter(dirPath, context) {
	/** @type {Page[]} */
	const pages = []
	const subdirs = []

	let components = { ...context.components }
	let Layout = context.Layout
	let ignore = context.ignore || /node_modules/
	if (!Array.isArray(ignore)) {
		ignore = [ignore]
	}

	const files = await fs.readdir(dirPath)

	for (const file of files) {
		if (match(file, ...ignore)) {
			continue
		}
		const filePath = path.join(dirPath, file)
		const stat = await fs.stat(filePath)

		if (stat.isDirectory()) {
			subdirs.push(filePath)
			continue
		}

		if (match(file, /(.|_)layout.(j|t)sx/)) {
			const InnerLayout = (await _import(filePath)).default
			if (!InnerLayout) continue
			if (Layout !== undefined) {
				const OuterLayout = Layout
				Layout = function Layout(/** @type {any} */ props) {
					return createElement(
						OuterLayout,
						props,
						createElement(InnerLayout, props)
					)
				}
			} else {
				Layout = InnerLayout
			}
			continue
		}
		if (match(file, /(.|_)components.(j|t)sx$/)) {
			const localComponents = await _import(filePath)
			if (localComponents) {
				components = { ...components, ...localComponents }
			}
			continue
		}

		if (file.startsWith('.')) continue

		// write regex to match .org and .tsx, .jsx files, javascript code only

		if (match(file, /\.(org)$/, /\.(j|t)sx$/)) {
			const module = await _import(filePath)
			const {
				default: /** @type import('@orgajs/orgx').OrgContent */ Content,
				...metadata
			} = module
			pages.push({
				Content,
				metadata,
				slug: context.buildHref(filePath, metadata),
				src: filePath
			})
		}
	}

	await Promise.all(
		pages.map((page) =>
			context.build({
				...page,
				metadata: {
					...page.metadata,
					pages: pages.map((p) => ({ ...p.metadata, slug: p.slug }))
				},
				Layout: Layout,
				components
			})
		)
	)

	// TODO: parallelize
	for (const subdir of subdirs) {
		await iter(subdir, {
			...context,
			Layout,
			components
		})
	}
}

/**
 * @param {typeof defaultConfig} options
 */
export async function build({ outDir, preBuild, postBuild }) {
	for (const cmd of preBuild) {
		console.log(`Running pre-build command: ${cmd}`)
		await $(cmd)
	}
	const start = performance.now()
	const cwd = process.cwd()
	const outFullPath = path.join(cwd, outDir)
	console.log(`Building to ${outFullPath}`)

	await iter(cwd, {
		buildHref: (filePath) => {
			return `/${path.relative(cwd, filePath).replace(/\.\w+$/, '.html')}`
		},
		ignore: [/node_modules/, 'out'],
		build: async ({ Layout, Content, metadata, src, components }) => {
			assert(Content, 'Content component is required')
			const e = createElement(
				Layout ?? DefaultLayout,
				metadata,
				createElement(Content, { components })
			)
			const code = renderToString(e)
			const filePath = path.relative(cwd, src).replace(/\.\w+$/, '.html')
			const outPath = path.resolve(outFullPath, filePath)
			await fs.mkdir(path.dirname(outPath), { recursive: true })
			const filesize = new Intl.NumberFormat().format(code.length)
			console.log(`${filePath} (${filesize} bytes)`)
			await fs.writeFile(outPath, code, { encoding: 'utf-8', flush: true })
		}
	})
	const end = performance.now()
	console.log(`Built in ${(end - start).toFixed(2)}ms`)

	for (const cmd of postBuild) {
		console.log(`Running post-build command: ${cmd}`)
		await $(cmd)
	}
}

/**
 * @param {string[]} files
 */
async function _import(...files) {
	const found = await globby(files, {
		cwd: process.cwd(),
		onlyFiles: true
	})
	if (found.length === 0) {
		return null
	}

	const file = found[0]
	const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
	const { mtime } = await fs.stat(fullPath)
	if (USE_NODE) {
		return await import(`${fullPath}?version=${mtime.getTime()}`)
	} else {
		return await evaluate(fullPath)
	}
}

/**
 * @param {import("fs").PathLike} dir
 */
export async function clean(dir) {
	await fs.rm(dir, { recursive: true })
}

/**
 * @returns {Promise<typeof defaultConfig>}
 */
export async function loadConfig() {
	const config = await _import('orga.config.(j|t)s')
	return { ...defaultConfig, ...config }
}
