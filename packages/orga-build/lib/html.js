import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exists } from './fs.js'
import { escapeHtml } from './util.js'

const defaultIndexHtml = fileURLToPath(new URL('./index.html', import.meta.url))

/**
 * Read the HTML shell: the user's `index.html` in the Vite root, or the
 * default one shipped with orga-build.
 *
 * @param {string} root - Vite root
 */
export async function readIndexHtml(root) {
	const userIndexHtml = path.join(root, 'index.html')
	const file = (await exists(userIndexHtml)) ? userIndexHtml : defaultIndexHtml
	return fs.readFile(file, 'utf-8')
}

/**
 * Makes `<root>/index.html` always loadable, falling back to the default shell,
 * so Vite can use it as the client build entry. Vite then bundles the entry
 * script and stylesheets and injects the hashed asset tags itself.
 *
 * Global styles are added as `<link>` tags, which Vite serves (with HMR) in
 * dev and bundles in build.
 *
 * @param {string[]} [styles]
 * @returns {import('vite').Plugin}
 */
export function htmlShellPlugin(styles = []) {
	/** @type {string} */
	let root
	/** @type {string} */
	let indexHtmlPath

	return {
		name: 'orga-build:html-shell',
		enforce: 'pre',
		configResolved(config) {
			root = config.root
			indexHtmlPath = path.join(root, 'index.html')
		},
		resolveId(id, importer) {
			// Build entries arrive relative to the root, without an importer.
			if (!importer && path.resolve(root, id) === indexHtmlPath) {
				return indexHtmlPath
			}
		},
		async load(id) {
			if (id === indexHtmlPath) {
				return readIndexHtml(root)
			}
		},
		transformIndexHtml: {
			order: 'pre',
			handler() {
				return [...new Set(styles)].map((href) => ({
					tag: 'link',
					attrs: { rel: 'stylesheet', href },
					injectTo: 'head'
				}))
			}
		}
	}
}

/**
 * Fill a processed HTML shell with a server-rendered page.
 *
 * @param {string} template - HTML shell, already transformed by Vite
 * @param {Object} options
 * @param {string} options.pathname - Route path of the page
 * @param {string | undefined} options.content - Rendered page markup
 * @param {Record<string, unknown> | undefined} options.page - Page module exports, used for `%orga.*%` placeholders
 */
export function renderPageHtml(template, { pathname, content, page }) {
	let html = template
	if (content) {
		const ssr = { routePath: pathname }
		html = html.replace(
			'<div id="root"></div>',
			`<script>window._ssr=${JSON.stringify(ssr)};</script><div id="root">${content}</div>`
		)
	}
	// Unknown routes have no page: their placeholders resolve to empty strings.
	return html.replace(/%orga\.(\w+)%/g, (_, key) =>
		escapeHtml(String(page?.[key] ?? ''))
	)
}
