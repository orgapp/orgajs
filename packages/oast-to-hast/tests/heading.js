import * as assert from 'node:assert'
import test from 'node:test'
import { h } from 'hastscript'
import { toHast } from '../index.js'

test('heading', async () => {
	const hast = toHast({
		type: 'headline',
		level: 3,
		children: [{ type: 'text', value: 'Hello' }]
	})

	assert.deepEqual(hast, h('h3', 'Hello'))
})
