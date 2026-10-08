import * as assert from 'node:assert'
import test from 'node:test'
import { parse } from 'orga'
import { toHast } from '../index.js'

/**
 * @param {any} node
 * @param {string} tagName
 * @returns {any[]}
 */
function select(node, tagName) {
	if (node.tagName === tagName) return [node]
	return (node.children ?? []).flatMap((/** @type {any} */ c) =>
		select(c, tagName)
	)
}

test('headings get ids from their text, unique per document', () => {
	const hast = toHast(
		parse(`* TODO [#A] Hello, /World/! :tag:
* Hello world
* 中文 标题`)
	)
	assert.deepEqual(
		select(hast, 'h1').map((h) => h.properties.id),
		['hello-world', 'hello-world-1', '中文-标题']
	)
})

test('CUSTOM_ID wins over the text slug and is reserved', () => {
	const hast = toHast(
		parse(`* Intro
* Other
:PROPERTIES:
:CUSTOM_ID: intro
:END:`)
	)
	assert.deepEqual(
		select(hast, 'h1').map((h) => h.properties.id),
		['intro-1', 'intro']
	)
})

test('same-page links target heading ids', () => {
	const hast = toHast(
		parse(`* Setup
:PROPERTIES:
:CUSTOM_ID: setup
:END:
* Usage
[[*Setup]] [[*usage]] [[#setup]] [[*Missing heading]]`)
	)
	assert.deepEqual(
		select(hast, 'a').map((a) => a.properties.href),
		['#setup', '#usage', '#setup', '#missing-heading']
	)
})

test('file links keep heading and custom-id searches as fragments', () => {
	const hast = toHast(
		parse(
			`[[file:x.org::*Some Heading]] [[./x.org::#custom]] [[file:x.org::12]] [[file:x.org::text]]`
		)
	)
	assert.deepEqual(
		select(hast, 'a').map((a) => a.properties.href),
		['x.org#some-heading', './x.org#custom', 'x.org', 'x.org']
	)
})

test('headlines outside sections get ids (flat: true)', () => {
	const flat = toHast(parse(`* Setup\n[[*Setup]]`, { flat: true }))
	assert.deepEqual(select(flat, 'h1')[0].properties.id, 'setup')
	assert.deepEqual(select(flat, 'a')[0].properties.href, '#setup')
})

test('headings skipped by tags take no ids', () => {
	const hast = toHast(parse(`* Same :noexport:\n* Same\n[[*Same]]`))
	assert.deepEqual(select(hast, 'h1')[0].properties.id, 'same')
	assert.deepEqual(select(hast, 'a')[0].properties.href, '#same')
})
