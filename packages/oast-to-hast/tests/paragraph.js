import test from 'node:test'
import * as assert from 'node:assert'
import { toHast } from '../index.js'

import { h } from 'hastscript'

test('paragraph with text', async () => {
	const hast = toHast({
		type: 'paragraph',
		children: [{ type: 'text', value: 'Hello' }],
	})

	assert.deepEqual(hast, h('p', 'Hello'))
})

test('paragraph with single media figure unwraps to figure', async () => {
	// A video link with a caption produces a <figure> from the link handler.
	// The paragraph handler must not wrap it in <p> (invalid HTML).
	const hast = toHast({
		type: 'paragraph',
		children: [
			{
				type: 'link',
				path: { value: 'demo.mp4' },
				attributes: { caption: 'A demo video' },
				children: [],
			},
		],
	})

	assert.deepEqual(
		hast,
		h('figure', [
			h('video', { src: 'demo.mp4', controls: true }),
			h('figcaption', 'A demo video'),
		])
	)
})

test('paragraph with text and media figure wraps in div', async () => {
	// Mixed content: text + block-level element → use <div> instead of <p>.
	const hast = toHast({
		type: 'paragraph',
		children: [
			{ type: 'text', value: 'Caption: ' },
			{
				type: 'link',
				path: { value: 'demo.mp4' },
				attributes: { caption: 'A demo video' },
				children: [],
			},
		],
	})

	assert.deepEqual(
		hast,
		h('div', [
			{ type: 'text', value: 'Caption: ' },
			h('figure', [
				h('video', { src: 'demo.mp4', controls: true }),
				h('figcaption', 'A demo video'),
			]),
		])
	)
})
