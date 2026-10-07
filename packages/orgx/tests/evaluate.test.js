import assert from 'node:assert'
import { describe, it } from 'node:test'
import { createElement } from 'react'
import * as runtime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { evaluate } from '../lib/evaluate.js'

describe('evaluate', () => {
	it('can evaluate org file', async () => {
		const text = `
* hi
`
		const Content = (await evaluate(text, runtime)).default
		const rendered = renderToStaticMarkup(createElement(Content))
		assert.equal(rendered, '<div class="section"><h1>hi</h1></div>')
	})
})

describe('metadata exports', () => {
	/** @param {string} text */
	async function exportsOf(text) {
		const { default: _, ...rest } = await evaluate(text, runtime)
		return rest
	}

	it('escapes values', async () => {
		const value = `Don't "panic" \\ ünï ✓`
		const { title } = await exportsOf(`#+title: ${value}\n`)
		assert.equal(title, value)
	})

	it('removes surrounding quotes', async () => {
		const { title } = await exportsOf(`#+title: "Hello"\n`)
		assert.equal(title, 'Hello')
	})

	it('exports repeated keys as arrays', async () => {
		const { tags } = await exportsOf(`#+tags: it's\n#+tags: b\n`)
		assert.deepEqual(tags, [`it's`, 'b'])
	})

	it('skips keys that are not valid identifiers', async () => {
		const result = await exportsOf(`#+1st: a\n#+class: b\n#+title: c\n`)
		assert.deepEqual(result, { title: 'c' })
	})
})
