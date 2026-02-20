import { test, describe, before, after } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from '../build.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(__dirname, 'fixtures')
const outDir = path.join(__dirname, '.test-output')

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
`
		)
		await fs.writeFile(path.join(fixtureDir, 'docs', 'index.org'), 'Docs index page.')
		await fs.writeFile(path.join(fixtureDir, 'more.org'), 'Another page.')
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
		assert.ok(html.includes('href="/docs"'), 'should rewrite docs/index.org to /docs')
		assert.ok(html.includes('href="/more"'), 'should rewrite more.org to /more')
	})

	test('generates assets directory', async () => {
		const assetsDir = path.join(outDir, 'assets')
		const assetsExists = await fs
			.access(assetsDir)
			.then(() => true)
			.catch(() => false)
		assert.ok(assetsExists, 'assets directory should exist')
	})
})
