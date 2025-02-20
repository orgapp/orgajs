import test from 'node:test'
import * as assert from 'node:assert'
import { toHast } from '../index.js'

import { h } from 'hastscript'

test('paragraph', async () => {
	const hast = toHast({
		type: 'paragraph',
		children: [{ type: 'text', value: 'Hello' }],
	})

	assert.deepEqual(hast, h('p', 'Hello'))
})
