import { describe, it } from 'node:test'
import assert from 'node:assert'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { evaluate } from '../src/evaluate'
import * as runtime from 'react/jsx-runtime'

describe('evaluate', () => {
  it('can evaluate org file', async () => {
    const text = `
#+title: hello
* hello
`
    const Content = (await evaluate(text, runtime)).default
    const rendered = renderToStaticMarkup(createElement(Content))
    assert.equal(rendered, '<div class="section"><h1>hello </h1></div>')
  })
})
