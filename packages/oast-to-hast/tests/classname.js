import * as assert from 'node:assert'
import test from 'node:test'
import { parse } from 'orga'
import { toHast } from '../index.js'

test('src blocks emit code.className as token array', () => {
	const oast = parse(`#+begin_src javascript
console.log('ok')
#+end_src`)
	const hast = toHast(oast)
	const code = hast.children[0]?.children?.[0]

	assert.deepEqual(code?.tagName, 'code')
	assert.deepEqual(code?.properties?.className, ['language-javascript'])
})

test('sections emit div.className as token array', () => {
	const oast = parse(`* Heading
:PROPERTIES:
:HTML_CONTAINER_CLASS: foo bar
:END:
Body`)
	const hast = toHast(oast)
	const section = hast.children[0]

	assert.deepEqual(section?.tagName, 'div')
	assert.deepEqual(section?.properties?.className, ['section', 'foo', 'bar'])
})
