import { globby } from 'globby'
import fs from 'node:fs/promises'
import { register } from 'node:module'
import path from 'path'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { URL } from 'url'

register('./jsx-loader.js', import.meta.url)
register('@orgajs/node-loader', import.meta.url)

/**
 * @param {object} options
 * @param {string} options.outDir
 */
export async function build({ outDir = 'out' }) {
	const cwd = process.cwd()
	const outFullPath = path.join(cwd, outDir)
	console.log(`Building to ${outFullPath}`)

	const filePaths = await globby(['**/*.org', '!_*', '!.*', '!node_modules'], {
		cwd,
		onlyFiles: true,
	})

	const files = filePaths.map(
		(file) => new URL(path.join(cwd, file), 'file://')
	)

	const { default: Layout } = await importLayout(cwd)
	const components = await importComponents(cwd)

	for (const url of files) {
		await buildFile(url)
	}

	/**
	 * @param {URL} url
	 */

	async function buildFile(url) {
		const { default: Content, title } = await _import(url.pathname)
		const e = createElement(
			Layout,
			{ title },
			createElement(Content, { components })
		)
		const code = renderToString(e)
		const filePath = path.relative(cwd, url.pathname).replace(/\.org$/, '.html')
		const outPath = path.resolve(outFullPath, filePath)
		await fs.mkdir(path.dirname(outPath), { recursive: true })
		const filesize = new Intl.NumberFormat().format(code.length)
		console.log(`Writing ${filePath} (${filesize} bytes)`)
		await fs.writeFile(outPath, code, { encoding: 'utf-8', flush: true })
	}
}

/**
 * @param {string} cwd
 */
export function importLayout(cwd) {
	// TODO: implement default layout
	const files = ['.layout.jsx', '.layout.tsx'].map((file) =>
		path.join(cwd, file)
	)
	return _import(...files) ?? { defaut: () => null }
}

/**
 * @param {string} cwd
 */
export async function importComponents(cwd) {
	const files = ['.components.jsx', '.components.tsx'].map((file) =>
		path.join(cwd, file)
	)
	return _import(...files) ?? {}
}

/**
 * @param {string[]} files
 */
export async function _import(...files) {
	const found = await globby(files, {
		onlyFiles: true,
	})
	if (found.length === 0) {
		return null
	}

	const file = found[0]
	const { mtime } = await fs.stat(file)
	return await import(`${file}?version=${mtime.getTime()}`)
}

/**
 * @param {import("fs").PathLike} dir
 */
export async function clean(dir) {
	await fs.rm(dir, { recursive: true })
}
