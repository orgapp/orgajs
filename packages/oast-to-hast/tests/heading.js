import test from 'node:test'
import * as assert from 'node:assert'
import { toHast } from '../index.js'

import { h } from 'hastscript'

test('heading', async () => {
	const hast = toHast({
		type: 'headline',
		level: 3,
		children: [{ type: 'text', value: 'Hello' }],
	})

	assert.deepEqual(hast, h('h3', 'Hello'))
})
