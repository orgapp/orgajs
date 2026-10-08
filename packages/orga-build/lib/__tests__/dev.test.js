import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { orgaBuildPlugin } from '../plugin.js'
import { writeIslandFixture } from './fixtures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Separate from the build tests: a Vite build sets NODE_ENV=production for the
// process, which makes React's dev JSX runtime unusable in a dev server after it.
describe('orga-build dev', () => {
	test('serves islands in dev under the configured base', async () => {
		const dir = path.join(__dirname, 'fixtures-dev')
		await writeIslandFixture(dir)
		const server = await createServer({
			root: dir,
			configFile: false,
			logLevel: 'silent',
			base: '/site/',
			server: { port: 5179 },
			plugins: orgaBuildPlugin({ root: dir })
		})
		try {
			await server.listen()
			const pageUrl = new URL(server.resolvedUrls?.local[0] ?? '')
			const html = await (
				await fetch(pageUrl, { headers: { accept: 'text/html' } })
			).text()
			const islandSrc = html.match(/<orga-island [^>]*src="([^"]+)"/)?.[1] ?? ''
			const script =
				html.match(/<script type="module" src="([^"]*island[^"]*\.js)"/)?.[1] ??
				''
			assert.equal(islandSrc, '/site/_components.tsx', html)
			assert.equal(script, '/site/@orga-build/islands.js')
			const nested = await (
				await fetch(new URL('docs/', pageUrl), {
					headers: { accept: 'text/html' }
				})
			).text()
			assert.match(nested, /client="visible"/, 'trailing slash finds the page')
			const missing = await fetch(new URL('nope', pageUrl), {
				headers: { accept: 'text/html' }
			})
			assert.equal(missing.status, 404, 'unknown routes are not rendered')
			for (const [url, marker] of [
				[islandSrc, 'Counter'],
				[script, 'hydrateRoot']
			]) {
				const response = await fetch(new URL(url, pageUrl))
				assert.equal(response.status, 200, url)
				assert.ok((await response.text()).includes(marker), url)
			}
		} finally {
			await server.close()
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('serves draft pages for preview', async () => {
		const dir = path.join(__dirname, 'fixtures-dev-drafts')
		await fs.mkdir(dir, { recursive: true })
		await fs.writeFile(path.join(dir, 'draft.org'), '#+draft: t\n\nWIP')
		const server = await createServer({
			root: dir,
			configFile: false,
			logLevel: 'silent',
			server: { port: 5181 },
			plugins: orgaBuildPlugin({ root: dir })
		})
		try {
			await server.listen()
			const url = new URL('draft', server.resolvedUrls?.local[0])
			const html = await (
				await fetch(url, { headers: { accept: 'text/html' } })
			).text()
			assert.ok(html.includes('WIP'), html)
		} finally {
			await server.close()
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('links page CSS and reloads the browser on server-rendered edits', async () => {
		const dir = path.join(__dirname, 'fixtures-dev-reload')
		await fs.mkdir(dir, { recursive: true })
		await fs.writeFile(path.join(dir, 'index.org'), '#+title: Home\n\nfirst\n')
		await fs.writeFile(path.join(dir, 'page.css'), '.page { color: red }\n')
		await fs.writeFile(
			path.join(dir, 'page.tsx'),
			`import './page.css'
export default function Page() {
	return <p className="page">hi</p>
}
`
		)
		const server = await createServer({
			root: dir,
			configFile: false,
			logLevel: 'silent',
			server: { port: 5180 },
			plugins: orgaBuildPlugin({ root: dir })
		})
		try {
			await server.listen()
			const pageUrl = new URL(server.resolvedUrls?.local[0] ?? '')
			const get = async (url = '') =>
				(
					await fetch(new URL(url, pageUrl), {
						headers: { accept: 'text/html' }
					})
				).text()

			const page = await get('page')
			assert.match(page, /<link rel="stylesheet" href="\/page\.css">/)
			const css = await fetch(new URL('page.css', pageUrl), {
				headers: { accept: 'text/css' }
			})
			assert.ok((await css.text()).includes('.page'))

			/** @type {unknown[]} */
			const sent = []
			server.environments.client.hot.send = (/** @type {any} */ payload) => {
				sent.push(payload)
			}
			await fs.writeFile(
				path.join(dir, 'index.org'),
				'#+title: Home\n\nsecond\n'
			)
			for (let i = 0; i < 50 && !sent.length; i++) {
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
			assert.ok(
				sent.some(
					(payload) => /** @type {any} */ (payload).type === 'full-reload'
				),
				'browser is told to reload'
			)
			assert.ok(
				(await get()).includes('second'),
				'next request renders the edit'
			)
		} finally {
			await server.close()
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('picks up added, renamed and deleted pages', async () => {
		const site = await startSite('fixtures-dev-pages', 5181, {
			'index.org': '#+title: Home\n\nhome\n'
		})
		try {
			await site.write('new.org', '#+title: New\n\nfresh page\n')
			await site.until('new', (html) => html.includes('fresh page'))

			await site.rename('new.org', 'renamed.org')
			await site.until('renamed', (html) => html.includes('fresh page'))
			await site.until('new', (html) => !html.includes('fresh page'))

			// A conflicting route is an error response; the server keeps running.
			await site.write('renamed.tsx', 'export default () => <p>tsx</p>\n')
			await site.until(
				'renamed',
				(html, status) => status === 500 && html.includes('Route conflict')
			)
			await site.remove('renamed.tsx')
			await site.until('renamed', (html) => html.includes('fresh page'))

			await site.remove('renamed.org')
			await site.until('renamed', (html) => !html.includes('fresh page'))
			assert.ok((await site.get()).html.includes('home'))
		} finally {
			await site.close()
		}
	})

	test('picks up added, edited and deleted layouts and components', async () => {
		const site = await startSite('fixtures-dev-layout', 5182, {
			'index.org': '#+title: Home\n\nhome\n',
			'greet.org': '#+title: Greet\n\n#+jsx: <Greeting />\n'
		})
		const layout = (/** @type {string} */ name) =>
			`export default function Layout({ children }) {
	return <main className="${name}">{children}</main>
}
`
		const greeting = (/** @type {string} */ text) =>
			`export function Greeting() {
	return <b>${text}</b>
}
`
		try {
			await site.write('_layout.tsx', layout('first'))
			await site.until('', (html) => html.includes('<main class="first">'))
			await site.write('_layout.tsx', layout('second'))
			await site.until('', (html) => html.includes('<main class="second">'))
			await site.remove('_layout.tsx')
			await site.until('', (html) => !html.includes('<main'))

			await site.write('_components.tsx', greeting('hello'))
			await site.until('greet', (html) => html.includes('<b>hello</b>'))
			await site.write('_components.tsx', greeting('bye'))
			await site.until('greet', (html) => html.includes('<b>bye</b>'))
			await site.remove('_components.tsx')
			await site.until(
				'',
				(html, status) => status === 200 && html.includes('home')
			)
		} finally {
			await site.close()
		}
	})

	test('getPages reflects metadata edits', async () => {
		const site = await startSite('fixtures-dev-content', 5183, {
			'post.org': '#+title: First\n\npost\n',
			'list.tsx': `import { getPages } from 'orga-build:content'
export default function List() {
	return <ul>{getPages().map((p) => <li key={p.slug}>{String(p.data.title)}</li>)}</ul>
}
`
		})
		try {
			await site.until('list', (html) => html.includes('<li>First</li>'))
			await site.write('post.org', '#+title: Second\n\npost\n')
			await site.until('list', (html) => html.includes('<li>Second</li>'))
			await site.write('other.org', '#+title: Other\n')
			await site.until('list', (html) => html.includes('<li>Other</li>'))
		} finally {
			await site.close()
		}
	})
})

/**
 * Starts a dev server on a fresh fixture directory.
 * @param {string} name
 * @param {number} port
 * @param {Record<string, string>} initial - file contents by relative path
 */
async function startSite(name, port, initial) {
	const dir = path.join(__dirname, name)
	await fs.rm(dir, { recursive: true, force: true })
	await fs.mkdir(dir, { recursive: true })
	for (const [file, content] of Object.entries(initial)) {
		await fs.writeFile(path.join(dir, file), content)
	}
	const server = await createServer({
		root: dir,
		configFile: false,
		logLevel: 'silent',
		server: { port },
		plugins: orgaBuildPlugin({ root: dir })
	})
	await server.listen()
	const pageUrl = new URL(server.resolvedUrls?.local[0] ?? '')

	async function get(url = '') {
		const response = await fetch(new URL(url, pageUrl), {
			headers: { accept: 'text/html' }
		})
		return { status: response.status, html: await response.text() }
	}

	return {
		get,
		/** @param {string} file @param {string} content */
		write: (file, content) => fs.writeFile(path.join(dir, file), content),
		/** @param {string} file */
		remove: (file) => fs.rm(path.join(dir, file)),
		/** @param {string} from @param {string} to */
		rename: (from, to) => fs.rename(path.join(dir, from), path.join(dir, to)),
		/**
		 * Polls `url` until `check` passes, as a browser would after reloading.
		 * @param {string} url
		 * @param {(html: string, status: number) => boolean} check
		 */
		async until(url, check) {
			let last = { status: 0, html: '' }
			for (let i = 0; i < 50; i++) {
				last = await get(url)
				if (check(last.html, last.status)) return
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
			assert.fail(`/${url} never matched; last ${last.status}:\n${last.html}`)
		},
		async close() {
			await server.close()
			await fs.rm(dir, { recursive: true, force: true })
		}
	}
}
