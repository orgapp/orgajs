import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { build } from '../build.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(__dirname, 'fixtures')
const outDir = path.join(__dirname, '.test-output')

function markCodeBlocks() {
	/**
	 * @param {any} tree
	 */
	return (tree) => {
		tree.children ||= []
		tree.children.unshift({
			type: 'element',
			tagName: 'div',
			properties: { id: 'rehype-plugin-ran' },
			children: []
		})
	}
}

describe('orga-build', () => {
	before(async () => {
		await fs.mkdir(fixtureDir, { recursive: true })
		await fs.mkdir(path.join(fixtureDir, 'docs'), { recursive: true })
		// Create minimal fixture
		await fs.writeFile(
			path.join(fixtureDir, 'index.org'),
			`#+title: Test Page

* Hello World

This is a test page.

Here's [[file:./docs/index.org][index page]].

Here's [[file:more.org][another page]].

Here's [[mailto:hi@unclex.net][send me an email]].
`
		)
		await fs.writeFile(
			path.join(fixtureDir, 'docs', 'index.org'),
			'Docs index page.'
		)
		await fs.writeFile(path.join(fixtureDir, 'more.org'), 'Another page.')
		await fs.writeFile(
			path.join(fixtureDir, 'rss.xml.ts'),
			`import { getPages } from 'orga-build:content'

export function GET() {
  const pages = getPages()
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><rss><count>' + pages.length + '</count></rss>',
    { headers: { 'content-type': 'application/xml; charset=utf-8' } }
  )
}
`
		)
		await fs.writeFile(
			path.join(fixtureDir, 'style.css'),
			'.global-style-marker { color: rgb(1, 2, 3); }'
		)
	})

	after(async () => {
		await fs.rm(outDir, { recursive: true, force: true })
		await fs.rm(fixtureDir, { recursive: true, force: true })
	})

	test('builds org files to HTML', async () => {
		await build({
			root: fixtureDir,
			outDir: outDir,
			containerClass: [],
			vitePlugins: [],
			preBuild: [],
			postBuild: []
		})

		// Check output exists
		const indexPath = path.join(outDir, 'index.html')
		const indexExists = await fs
			.access(indexPath)
			.then(() => true)
			.catch(() => false)
		assert.ok(indexExists, 'index.html should exist')

		// Check content
		const html = await fs.readFile(indexPath, 'utf-8')
		assert.ok(html.includes('<title>Test Page</title>'), 'should have title')
		assert.ok(html.includes('Hello World'), 'should have heading content')
		assert.ok(
			html.includes('href="/docs"'),
			'should rewrite docs/index.org to /docs'
		)
		assert.ok(html.includes('href="/more"'), 'should rewrite more.org to /more')
		assert.ok(
			html.includes('href="mailto:hi@unclex.net"'),
			'should keep mailto protocol in href'
		)
	})

	test('generates assets directory', async () => {
		const assetsDir = path.join(outDir, 'assets')
		const assetsExists = await fs
			.access(assetsDir)
			.then(() => true)
			.catch(() => false)
		assert.ok(assetsExists, 'assets directory should exist')
	})

	test('processes configured global styles through vite and injects built css', async () => {
		const styleUrl = '/' + path.relative(process.cwd(), path.join(fixtureDir, 'style.css'))
		await build({
			root: fixtureDir,
			outDir: outDir,
			containerClass: [],
			styles: [styleUrl],
			vitePlugins: [],
			preBuild: [],
			postBuild: []
		})

		const html = await fs.readFile(path.join(outDir, 'index.html'), 'utf-8')
		assert.ok(
			!html.includes('href="/style.css"'),
			'should not link raw source css path'
		)

		const cssHrefMatch = html.match(/href="\/(assets\/[^"]+\.css)"/)
		assert.ok(
			cssHrefMatch,
			'should link built css asset from assets with hashed name'
		)

		const builtCssPath = cssHrefMatch[1]
		const builtCss = await fs.readFile(path.join(outDir, builtCssPath), 'utf-8')
		assert.ok(
			builtCss.includes('.global-style-marker'),
			'built css should include configured global style content'
		)
	})

	test('applies custom rehype plugins from config', async () => {
		const fixtureDirRehype = path.join(__dirname, 'fixtures-rehype')
		const outDirRehype = path.join(__dirname, '.test-output-rehype')

		try {
			await fs.mkdir(fixtureDirRehype, { recursive: true })
			await fs.writeFile(
				path.join(fixtureDirRehype, 'index.org'),
				`#+title: Rehype Test

This page verifies custom rehype plugins.`
			)

			await build({
				root: fixtureDirRehype,
				outDir: outDirRehype,
				containerClass: [],
				rehypePlugins: [markCodeBlocks],
				vitePlugins: [],
				preBuild: [],
				postBuild: []
			})

			const html = await fs.readFile(
				path.join(outDirRehype, 'index.html'),
				'utf-8'
			)
			assert.ok(
				html.includes('rehype-plugin-ran'),
				'should apply user-provided rehype plugins to rendered HTML'
			)
		} finally {
			await fs.rm(outDirRehype, { recursive: true, force: true })
			await fs.rm(fixtureDirRehype, { recursive: true, force: true })
		}
	})

	test('emits endpoint routes with exact output filenames', async () => {
		await build({
			root: fixtureDir,
			outDir: outDir,
			containerClass: [],
			vitePlugins: [],
			preBuild: [],
			postBuild: []
		})

		const rss = await fs.readFile(path.join(outDir, 'rss.xml'), 'utf-8')
		assert.ok(
			rss.includes('<rss>') && rss.includes('<count>'),
			'should emit rss.xml from GET endpoint'
		)
	})

	test('fails on duplicate route conflicts', async () => {
		const fixtureDirConflict = path.join(__dirname, 'fixtures-conflict')
		const outDirConflict = path.join(__dirname, '.test-output-conflict')
		try {
			await fs.mkdir(fixtureDirConflict, { recursive: true })
			await fs.writeFile(path.join(fixtureDirConflict, 'index.org'), 'Home')
			await fs.writeFile(
				path.join(fixtureDirConflict, 'index.tsx'),
				'export default function Page() { return <div>Index</div> }'
			)

			await assert.rejects(
				() =>
					build({
						root: fixtureDirConflict,
						outDir: outDirConflict,
						containerClass: [],
						vitePlugins: [],
						preBuild: [],
						postBuild: []
					}),
				/Route conflict detected/
			)
		} finally {
			await fs.rm(outDirConflict, { recursive: true, force: true })
			await fs.rm(fixtureDirConflict, { recursive: true, force: true })
		}
	})
})
