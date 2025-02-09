import { exec } from 'child_process'
import { globby } from 'globby'
import fs from 'node:fs/promises'
import { register } from 'node:module'
import path from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

register('./jsx-loader.js', import.meta.url)
register('@orgajs/node-loader', import.meta.url)

const defaultConfig = {
	outDir: 'out',
	/** @type {string[]} */
	preBuild: [],
	/** @type {string[]} */
	postBuild: [],
}

/**
 * @typedef {Object} Page
 * @property {import('@orgajs/orgx').OrgContent} Content
 * @property {Record<string, any>} metadata - The metadata from the org file export, will be passed to the Layout component
 * @property {string} src - The absolute path to the org file
 * @property {string} slug - The slug for the page
 */

/**
 * @typedef {Object} BuildContext
 * @property {import('@orgajs/orgx').OrgComponents} [components] - The components from the org file
 * @property {import('react').ComponentType<any>} [Layout] - The layout component
 * @property {RegExp} [ignore] - A regular expression to ignore files/directories
 * @property {(page: Page & { Layout?: import('react').ComponentType, components: Record<string, any> }) => Promise<void>} build - The build function
 * @property {(filePath: string, metadata: Record<string, any>) => string} buildHref - The build function
 */

/**
 * Recursively processes a directory to build pages from .org files
 * @param {string} dirPath - The directory path to process
 * @param {BuildContext} [context={}] - Build context containing components, layout, and build function
 * @returns {Promise<void>}
 */
async function iter(dirPath, context) {
	/** @type {Page[]} */
	const pages = []
	const subdirs = []

	let components = { ...context.components }
	let Layout = context.Layout
	const ignore = context.ignore || /node_modules/

	const files = await fs.readdir(dirPath)

	for (const file of files) {
		if (ignore.test(file)) continue
		const filePath = path.join(dirPath, file)
		const stat = await fs.stat(filePath)

		if (stat.isDirectory()) {
			subdirs.push(filePath)
			continue
		}

		if (file.match(/(.|_)layout.(j|t)sx/)) {
			const InnerLayout = (await _import(filePath)).default
			if (context.Layout) {
				Layout = function Layout(/** @type {any} */ props) {
					return createElement(
						context.Layout,
						props,
						createElement(InnerLayout, props)
					)
				}
			} else {
				Layout = InnerLayout
			}
		}
		if (file.match(/(.|_)components.(j|t)sx/)) {
			const localComponents = await _import(filePath)
			components = { ...components, ...localComponents }
		}

		if (file.startsWith('.')) continue

		if (/\.org$/.test(file)) {
			const {
				default: /** @type import('@orgajs/orgx').OrgContent */ Content,
				...metadata
			} = await _import(filePath)
			pages.push({
				Content,
				metadata,
				slug: context.buildHref(filePath, metadata),
				src: filePath,
			})
		}
	}

	await Promise.all(
		pages.map((page) =>
			context.build({
				...page,
				metadata: {
					...page.metadata,
					pages: pages.map((p) => ({ ...p.metadata, slug: p.slug })),
				},
				Layout,
				components,
			})
		)
	)

	// TODO: parallelize
	for (const subdir of subdirs) {
		await iter(subdir, {
			...context,
			Layout,
			components,
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
			return `/${path.relative(cwd, filePath).replace(/\.org$/, '.html')}`
		},
		build: async ({ Layout, Content, metadata, src, components }) => {
			const e = createElement(
				Layout,
				metadata,
				createElement(Content, { components })
			)
			const code = renderToString(e)
			const filePath = path.relative(cwd, src).replace(/\.org$/, '.html')
			const outPath = path.resolve(outFullPath, filePath)
			await fs.mkdir(path.dirname(outPath), { recursive: true })
			const filesize = new Intl.NumberFormat().format(code.length)
			console.log(`${filePath} (${filesize} bytes)`)
			await fs.writeFile(outPath, code, { encoding: 'utf-8', flush: true })
		},
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
		onlyFiles: true,
	})
	if (found.length === 0) {
		return null
	}

	const file = found[0]
	const fullPath = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
	const { mtime } = await fs.stat(fullPath)
	return await import(`${fullPath}?version=${mtime.getTime()}`)
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

/**
 * @param {string} cmd
 */
async function $(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			if (stderr) {
				console.error(stderr)
			}
			console.log(stdout)
			resolve(stdout)
		})
	})
}
