import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createBuilder } from 'vite'
import { build } from '../build.js'
import { renderPageHtml } from '../html.js'
import { orgaBuildPlugin } from '../plugin.js'
import { writeIslandFixture } from './fixtures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(__dirname, 'fixtures')
const outDir = path.join(__dirname, '.test-output')

/**
 * Build `dir` with plain Vite and only `orgaBuildPlugin`, as a
 * `vite.config.js` would, without the orga-build CLI.
 * @param {string} dir
 * @param {import('vite').InlineConfig} [config]
 */
async function viteBuild(dir, config = {}) {
	const builder = await createBuilder({
		root: dir,
		configFile: false,
		logLevel: 'silent',
		plugins: orgaBuildPlugin({ root: dir }),
		...config
	})
	await builder.buildApp()
}

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
			vitePlugins: []
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

	test('ships no JavaScript without islands', async () => {
		const html = await fs.readFile(path.join(outDir, 'index.html'), 'utf-8')
		assert.ok(!html.includes('<script'), html)
	})

	test("hydrates 'use client' components as islands", async () => {
		const dir = path.join(__dirname, 'fixtures-islands')
		try {
			await writeIslandFixture(dir)
			await viteBuild(dir)

			const html = await fs.readFile(
				path.join(dir, 'dist', 'index.html'),
				'utf-8'
			)
			const island = html.match(/<orga-island ([^>]+)>/)?.[1] ?? ''
			const islandSrc = island.match(/src="([^"]+)"/)?.[1] ?? ''
			assert.match(islandSrc, /^\/assets\/.+\.js$/)
			assert.match(island, /export="Counter"/)
			assert.match(island, /props="{&quot;start&quot;:1}"/)
			assert.match(island, /client="load"/)
			assert.match(island, /prefix="island-0-"/)
			assert.match(
				html,
				/<button id="[^"]*island-0-[^"]*">1<\/button>/,
				'island is prerendered with its own useId prefix'
			)
			const chunk = await fs.readFile(
				path.join(dir, 'dist', islandSrc),
				'utf-8'
			)
			assert.match(chunk, /\bCounter\b/, 'island chunk keeps its exports')

			const script =
				html.match(/<script type="module" src="([^"]*island[^"]*\.js)"/)?.[1] ??
				''
			assert.match(script, /^\/assets\//, html)
			await fs.access(path.join(dir, 'dist', script))

			const nested = await fs.readFile(
				path.join(dir, 'dist', 'docs', 'index.html'),
				'utf-8'
			)
			assert.match(nested, /<orga-island [^>]*client="visible"/)
			assert.match(
				nested,
				/<orga-island [^>]*export="MemoCounter" props="{&quot;start&quot;:3,&quot;meta&quot;:{&quot;children&quot;:\[&quot;a&quot;\]}}"/,
				'nested `children` keys are data; undefined is dropped'
			)

			const plain = await fs.readFile(
				path.join(dir, 'dist', 'plain', 'index.html'),
				'utf-8'
			)
			assert.ok(!plain.includes('<script'), 'pages without islands stay static')

			const page = await fs.readFile(
				path.join(dir, 'dist', 'page', 'index.html'),
				'utf-8'
			)
			assert.match(page, /<title>Page<\/title>/)
			assert.match(page, /<orga-island [^>]*export="default" props="{}"/)
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('processes configured global styles through vite and injects built css', async () => {
		const styleUrl =
			'/' + path.relative(process.cwd(), path.join(fixtureDir, 'style.css'))
		await build({
			root: fixtureDir,
			outDir: outDir,
			containerClass: [],
			styles: [styleUrl],
			vitePlugins: []
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
				vitePlugins: []
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
			vitePlugins: []
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
						vitePlugins: []
					}),
				/Route conflict detected/
			)
		} finally {
			await fs.rm(outDirConflict, { recursive: true, force: true })
			await fs.rm(fixtureDirConflict, { recursive: true, force: true })
		}
	})

	test("excludes Vite's output directory from content discovery", async () => {
		const dir = path.join(__dirname, 'fixtures-vite-outdir')
		// Dotted chunk names would make bundles look like endpoint routes.
		const buildOnce = () =>
			viteBuild(dir, {
				build: {
					rolldownOptions: {
						output: { entryFileNames: 'assets/[name].[hash].js' }
					}
				}
			})
		try {
			await fs.mkdir(dir, { recursive: true })
			await fs.writeFile(path.join(dir, 'index.org'), '#+title: Home\n\nHome')

			await buildOnce()
			// The second build sees the first build's output inside the root.
			await buildOnce()

			const html = await fs.readFile(
				path.join(dir, 'dist', 'index.html'),
				'utf-8'
			)
			assert.ok(html.includes('<title>Home</title>'))
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('leaves draft pages out of the build', async () => {
		const dir = path.join(__dirname, 'fixtures-drafts')
		try {
			await fs.mkdir(dir, { recursive: true })
			await fs.writeFile(path.join(dir, 'index.org'), 'Home')
			await fs.writeFile(path.join(dir, 'draft.org'), '#+draft: t\n\nWIP')
			await fs.writeFile(
				path.join(dir, 'published.org'),
				'#+draft: false\n\nDone'
			)
			await fs.writeFile(
				path.join(dir, 'pages.json.ts'),
				`import { getPages } from 'orga-build:content'
export function GET() {
  return Response.json(getPages().map((page) => page.slug).sort())
}
`
			)

			await viteBuild(dir)

			const out = path.join(dir, 'dist')
			const slugs = JSON.parse(
				await fs.readFile(path.join(out, 'pages.json'), 'utf-8')
			)
			assert.deepEqual(slugs, ['/', '/published'])
			await fs.access(path.join(out, 'published', 'index.html'))
			await assert.rejects(fs.access(path.join(out, 'draft', 'index.html')))
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('prerenders after a configured builder.buildApp', async () => {
		const dir = path.join(__dirname, 'fixtures-vite-builder')
		try {
			await writeIslandFixture(dir)

			await viteBuild(dir, {
				builder: {
					// Builds every environment itself, client first (as e.g. the
					// Cloudflare plugin does): that client build predates island
					// discovery and must be redone.
					async buildApp(builder) {
						await builder.build(builder.environments.client)
						await builder.build(builder.environments.ssr)
					}
				}
			})

			const html = await fs.readFile(
				path.join(dir, 'dist', 'index.html'),
				'utf-8'
			)
			assert.ok(html.includes('<title>Home</title>'), 'page should survive')
			const islandSrc = html.match(/<orga-island [^>]*src="([^"]+)"/)?.[1]
			assert.ok(islandSrc, 'island is rendered')
			await fs.access(path.join(dir, 'dist', islandSrc))
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('rejects island props that cannot reach the browser', async () => {
		const dir = path.join(__dirname, 'fixtures-island-props')
		try {
			await writeIslandFixture(dir)
			await fs.writeFile(
				path.join(dir, 'index.org'),
				'#+jsx: <Counter start={1} config={{ onClick: () => {} }} />\n'
			)
			await assert.rejects(() => viteBuild(dir), /prop "onClick" can't be sent/)
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('emits images and CSS imported by pages', async () => {
		const dir = path.join(__dirname, 'fixtures-page-assets')
		try {
			await fs.mkdir(dir, { recursive: true })
			// Larger than Vite's inline limit, so it is emitted as a file.
			await fs.writeFile(path.join(dir, 'pic.png'), Buffer.alloc(8192, 1))
			await fs.writeFile(path.join(dir, "it's.png"), Buffer.alloc(8192, 2))
			await fs.writeFile(
				path.join(dir, 'index.org'),
				"[[./pic.png]]\n\n[[./it's.png]]\n"
			)
			await fs.writeFile(path.join(dir, 'page.css'), '.page { color: red }\n')
			await fs.writeFile(
				path.join(dir, 'page.tsx'),
				`import './page.css'
export default function Page() {
	return <p className="page">hi</p>
}
`
			)
			await fs.writeFile(
				path.join(dir, 'feed.json.ts'),
				`import pic from './pic.png'
export function GET() {
	return Response.json({ pic })
}
`
			)
			await viteBuild(dir, { build: { sourcemap: true } })
			// The SSR bundle and its source map are not part of the site.
			for (const file of ['ssr.mjs', 'ssr.mjs.map']) {
				await assert.rejects(fs.access(path.join(dir, 'dist', file)), file)
			}

			const html = await fs.readFile(
				path.join(dir, 'dist', 'index.html'),
				'utf-8'
			)
			const img = html.match(/<img src="\/(assets\/pic-[^"]+\.png)"/)?.[1] ?? ''
			assert.ok(img, html)
			await fs.access(path.join(dir, 'dist', img))
			assert.equal(html.match(/<img src="\/assets\//g)?.length, 2, html)

			const feed = JSON.parse(
				await fs.readFile(path.join(dir, 'dist', 'feed.json'), 'utf-8')
			)
			assert.equal(feed.pic, `/${img}`, 'endpoints get real asset URLs too')

			const page = await fs.readFile(
				path.join(dir, 'dist', 'page', 'index.html'),
				'utf-8'
			)
			const css =
				page.match(
					/<link rel="stylesheet" href="\/(assets\/[^"]+\.css)"/
				)?.[1] ?? ''
			assert.ok(css, page)
			const built = await fs.readFile(path.join(dir, 'dist', css), 'utf-8')
			assert.ok(built.includes('.page'), built)
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})

	test('injects head tags for a page that renders nothing', () => {
		const html = renderPageHtml(
			'<html><head></head><body><div id="root"></div></body></html>',
			{ content: '', page: {}, styles: ['/s.css'] }
		)
		assert.match(html, /<link rel="stylesheet" href="\/s.css"><\/head>/)
	})

	test('rebases relative asset URLs for nested pages', async () => {
		const dir = path.join(__dirname, 'fixtures-vite-base')
		try {
			await writeIslandFixture(dir)

			await viteBuild(dir, { base: './' })

			for (const [page, prefix] of [
				['', './'],
				['docs', '../']
			]) {
				const pageDir = path.join(dir, 'dist', page)
				const html = await fs.readFile(
					path.join(pageDir, 'index.html'),
					'utf-8'
				)
				for (const pattern of [
					/<script type="module"[^>]* src="([^"]+)"/,
					/<orga-island [^>]*src="([^"]+)"/,
					...(page ? [/<img src="([^"]+)"/] : [])
				]) {
					const src = html.match(pattern)?.[1] ?? ''
					assert.ok(
						src.startsWith(`${prefix}assets/`),
						`${page || '/'}: ${src}`
					)
					await fs.access(path.join(pageDir, src))
				}
			}
		} finally {
			await fs.rm(dir, { recursive: true, force: true })
		}
	})
})
