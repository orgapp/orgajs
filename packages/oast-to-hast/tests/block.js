import * as assert from 'node:assert'
import test from 'node:test'
import { h } from 'hastscript'
import { parse } from 'orga'
import { toHast } from '../index.js'

test('quote block preserves inline markup', () => {
	const oast = parse(`#+BEGIN_QUOTE
Be *bold*, and if you must, be /italic/.
#+END_QUOTE
`)

	const hast = removePosition(toHast(oast))

	assert.deepEqual(hast, {
		type: 'root',
		data: {},
		children: [
			h('blockquote', [
				'Be ',
				h('strong', 'bold'),
				', and if you must, be ',
				h('i', 'italic'),
				'.'
			])
		]
	})
})

function removePosition(node) {
	if (!node || typeof node !== 'object') return node
	if (Array.isArray(node)) return node.map(removePosition)
	const result = {}
	for (const [key, value] of Object.entries(node)) {
		if (key === 'position') continue
		result[key] = removePosition(value)
	}
	return result
}
