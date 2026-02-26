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
