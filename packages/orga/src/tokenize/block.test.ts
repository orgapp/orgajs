import assert from 'node:assert'
import { describe, it } from 'node:test'
import tokenize from './__tests__/tok'

describe('tokenize block', () => {
	it('knows block begins', () => {
		assert.deepEqual(tokenize('#+BEGIN_SRC swift'), [
			{
				_text: '#+BEGIN_SRC swift',
				name: 'SRC',
				params: ['swift'],
				type: 'block.begin'
			}
		])

		assert.deepEqual(tokenize('#+begin_src swift'), [
			{
				_text: '#+begin_src swift',
				name: 'src',
				params: ['swift'],
				type: 'block.begin'
			}
		])
		assert.deepEqual(tokenize('#+begin_example'), [
			{
				_text: '#+begin_example',
				name: 'example',
				params: [],
				type: 'block.begin'
			}
		])
		assert.deepEqual(tokenize('#+begin_ex😀mple'), [
			{
				_text: '#+begin_ex😀mple',
				name: 'ex😀mple',
				params: [],
				type: 'block.begin'
			}
		])
		assert.deepEqual(tokenize('#+begin_src swift :tangle code.swift'), [
			{
				_text: '#+begin_src swift :tangle code.swift',
				name: 'src',
				params: ['swift', ':tangle', 'code.swift'],
				type: 'block.begin'
			}
		])
	})

	it('knows these are not block begins', () => {
		assert.deepEqual(tokenize('#+begi😀n_src swift'), [
			{
				_text: '#+begi😀n_src swift',
				type: 'text',
				value: '#+begi😀n_src swift'
			}
		])
	})

	it('knows block ends', () => {
		assert.deepEqual(tokenize('#+END_SRC'), [
			{
				_text: '#+END_SRC',
				name: 'SRC',
				type: 'block.end'
			}
		])
		assert.deepEqual(tokenize('  #+END_SRC'), [
			{
				_text: '#+END_SRC',
				name: 'SRC',
				type: 'block.end'
			}
		])
		assert.deepEqual(tokenize('#+end_src'), [
			{
				_text: '#+end_src',
				name: 'src',
				type: 'block.end'
			}
		])
		assert.deepEqual(tokenize('#+end_SRC'), [
			{
				_text: '#+end_SRC',
				name: 'SRC',
				type: 'block.end'
			}
		])
		assert.deepEqual(tokenize('#+end_S😀RC'), [
			{
				_text: '#+end_S😀RC',
				name: 'S😀RC',
				type: 'block.end'
			}
		])
		assert.deepEqual(tokenize('#+end_SRC '), [
			{
				_text: '#+end_SRC ',
				name: 'SRC',
				type: 'block.end'
			}
		])
	})

	it('knows these are not block ends', () => {
		assert.deepEqual(tokenize('#+end_src param'), [
			{
				_text: '#+end_src param',
				type: 'text',
				value: '#+end_src param'
			}
		])
	})
})
