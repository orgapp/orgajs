import test from 'node:test'
import * as assert from 'node:assert'
import { toHast } from '../index.js'
import { h } from 'hastscript'

test('regular unordered list', () => {
	const hast = toHast({
		type: 'list',
		ordered: false,
		indent: 0,
		children: [
			{ type: 'list.item', indent: 0, children: [{ type: 'text', value: 'item one' }] },
			{ type: 'list.item', indent: 0, children: [{ type: 'text', value: 'item two' }] },
		],
	})

	assert.deepEqual(hast, h('ul', [h('li', 'item one'), h('li', 'item two')]))
})

test('pure definition list produces <dl> with flat <dt>/<dd> pairs (no <div> wrapper)', () => {
	const hast = toHast({
		type: 'list',
		ordered: false,
		indent: 0,
		children: [
			{
				type: 'list.item',
				indent: 0,
				tag: 'word',
				children: [{ type: 'text', value: 'description.' }],
			},
			{
				type: 'list.item',
				indent: 0,
				tag: 'another',
				children: [{ type: 'text', value: 'definition.' }],
			},
		],
	})

	assert.deepEqual(
		hast,
		h('dl', [
			h('dt', 'word'),
			h('dd', 'description.'),
			h('dt', 'another'),
			h('dd', 'definition.'),
		])
	)
})

test('pure definition list followed by a paragraph still produces <dl>', () => {
	// The parser appends a trailing newline node as a child of the list when
	// followed by a blank line + paragraph. It must not be mistaken for a
	// non-tagged item.
	const hast = toHast({
		type: 'list',
		ordered: false,
		indent: 0,
		children: [
			{
				type: 'list.item',
				indent: 0,
				tag: 'hello',
				children: [{ type: 'text', value: 'this is greeting.' }],
			},
			{
				type: 'list.item',
				indent: 0,
				tag: 'world',
				children: [{ type: 'text', value: 'this is the world.' }],
			},
			{ type: 'newline' },
		],
	})

	assert.deepEqual(
		hast,
		h('dl', [
			h('dt', 'hello'),
			h('dd', 'this is greeting.'),
			h('dt', 'world'),
			h('dd', 'this is the world.'),
		])
	)
})

test('mixed list wraps definition items as <li><dl><dt>/<dd></dl></li>', () => {
	const hast = toHast({
		type: 'list',
		ordered: false,
		indent: 0,
		children: [
			{
				type: 'list.item',
				indent: 0,
				children: [{ type: 'text', value: 'item one' }],
			},
			{
				type: 'list.item',
				indent: 0,
				tag: 'word',
				children: [{ type: 'text', value: 'definition goes here.' }],
			},
		],
	})

	assert.deepEqual(
		hast,
		h('ul', [
			h('li', 'item one'),
			h('li', [h('dl', [h('dt', 'word'), h('dd', 'definition goes here.')])]),
		])
	)
})
