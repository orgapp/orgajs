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
})
