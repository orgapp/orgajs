import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('Inline Tokenization', () => {
	it('recon single emphasis', () => {
		assert.deepEqual(tokenize('hello *world*, welcome to *org-mode*.'), [
			{
				_text: 'hello ',
				type: 'text',
				value: 'hello '
			},
			{
				_text: '*world*',
				style: 'bold',
				type: 'text',
				value: 'world'
			},
			{
				_text: ', welcome to ',
				type: 'text',
				value: ', welcome to '
			},
			{
				_text: '*org-mode*',
				style: 'bold',
				type: 'text',
				value: 'org-mode'
			},
			{
				_text: '.',
				type: 'text',
				value: '.'
			}
		])
	})

	it('recon emphasises at different locations', () => {
		assert.deepEqual(tokenize('one *two* three'), [
			{
				_text: 'one ',
				type: 'text',
				value: 'one '
			},
			{
				_text: '*two*',
				style: 'bold',
				type: 'text',
				value: 'two'
			},
			{
				_text: ' three',
				type: 'text',
				value: ' three'
			}
		])
		assert.deepEqual(tokenize('*one* two three'), [
			{
				_text: '*one*',
				style: 'bold',
				type: 'text',
				value: 'one'
			},
			{
				_text: ' two three',
				type: 'text',
				value: ' two three'
			}
		])
		assert.deepEqual(tokenize('one two *three*'), [
			{
				_text: 'one two ',
				type: 'text',
				value: 'one two '
			},
			{
				_text: '*three*',
				style: 'bold',
				type: 'text',
				value: 'three'
			}
		])
	})

	it('recon link', () => {
		assert.deepEqual(tokenize(`hello [[./image/logo.png]]`), [
			{
				_text: 'hello ',
				type: 'text',
				value: 'hello '
			},
			{
				_text: '[',
				element: 'link',
				type: 'opening'
			},
			{
				_text: '[./image/logo.png]',
				protocol: 'file',
				search: undefined,
				type: 'link.path',
				value: './image/logo.png'
			},
			{
				_text: ']',
				element: 'link',
				type: 'closing'
			}
		])

		assert.deepEqual(tokenize(`hello [[Internal Link][link]]`), [
			{
				_text: 'hello ',
				type: 'text',
				value: 'hello '
			},
			{
				_text: '[',
				element: 'link',
				type: 'opening'
			},
			{
				_text: '[Internal Link]',
				protocol: 'internal',
				search: undefined,
				type: 'link.path',
				value: 'Internal Link'
			},
			{
				_text: 'link',
				type: 'text',
				value: 'link'
			},
			{
				_text: ']',
				element: 'link',
				type: 'closing'
			}
		])

		assert.deepEqual(tokenize(`hello [[../image/logo.png][logo]]`), [
			{
				_text: 'hello ',
				type: 'text',
				value: 'hello '
			},
			{
				_text: '[',
				element: 'link',
				type: 'opening'
			},
			{
				_text: '[../image/logo.png]',
				protocol: 'file',
				search: undefined,
				type: 'link.path',
				value: '../image/logo.png'
			},
			{
				_text: 'logo',
				type: 'text',
				value: 'logo'
			},
			{
				_text: ']',
				element: 'link',
				type: 'closing'
			}
		])

		assert.deepEqual(tokenize(`that is a [[../image/logo.png][/nice/ logo]]`), [
			{
				_text: 'that is a ',
				type: 'text',
				value: 'that is a '
			},
			{
				_text: '[',
				element: 'link',
				type: 'opening'
			},
			{
				_text: '[../image/logo.png]',
				protocol: 'file',
				search: undefined,
				type: 'link.path',
				value: '../image/logo.png'
			},
			{
				_text: '/nice/',
				style: 'italic',
				type: 'text',
				value: 'nice'
			},
			{
				_text: ' logo',
				type: 'text',
				value: ' logo'
			},
			{
				_text: ']',
				element: 'link',
				type: 'closing'
			}
		])
	})

	it('recon footnote reference', () => {
		assert.deepEqual(tokenize(`hello[fn:1] world.`), [
			{
				_text: 'hello',
				type: 'text',
				value: 'hello'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: '1',
				label: '1',
				type: 'footnote.label'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ' world.',
				type: 'text',
				value: ' world.'
			}
		])
	})

	it('recon anonymous footnote reference', () => {
		assert.deepEqual(tokenize('hello[fn::Anonymous] world.'), [
			{
				_text: 'hello',
				type: 'text',
				value: 'hello'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: 'Anonymous',
				type: 'text',
				value: 'Anonymous'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ' world.',
				type: 'text',
				value: ' world.'
			}
		])
	})

	it('recon anonymous footnote reference with inner footnote reference', () => {
		assert.deepEqual(tokenize('hello[fn::[fn::Anonymous]] world.'), [
			{
				_text: 'hello',
				type: 'text',
				value: 'hello'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: 'Anonymous',
				type: 'text',
				value: 'Anonymous'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ' world.',
				type: 'text',
				value: ' world.'
			}
		])
	})

	it('recon anonymous footnote reference with empty body', () => {
		assert.deepEqual(tokenize('hello[fn::] world.'), [
			{
				_text: 'hello',
				type: 'text',
				value: 'hello'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ' world.',
				type: 'text',
				value: ' world.'
			}
		])
	})

	it('recon named inline footnote', () => {
		assert.deepEqual(tokenize('hello[fn:named:Inline named footnote] world.'), [
			{
				_text: 'hello',
				type: 'text',
				value: 'hello'
			},
			{
				_text: '[fn:',
				element: 'footnote.reference',
				type: 'opening'
			},
			{
				_text: 'named',
				label: 'named',
				type: 'footnote.label'
			},
			{
				_text: 'Inline named footnote',
				type: 'text',
				value: 'Inline named footnote'
			},
			{
				_text: ']',
				element: 'footnote.reference',
				type: 'closing'
			},
			{
				_text: ' world.',
				type: 'text',
				value: ' world.'
			}
		])
	})

	it('recon invalid inline markups', () => {
		assert.deepEqual(tokenize(`* word*`), [
			{
				_text: '*',
				level: 1,
				type: 'stars'
			},
			{
				_text: 'word*',
				type: 'text',
				value: 'word*'
			}
		])
		assert.deepEqual(tokenize(`*word *`), [
			{
				_text: '*word *',
				type: 'text',
				value: '*word *'
			}
		])
	})

	it('recon emphasises with 2 chars', () => {
		assert.deepEqual(tokenize(`*12*`), [
			{
				_text: '*12*',
				style: 'bold',
				type: 'text',
				value: '12'
			}
		])
		assert.deepEqual(tokenize(`*1*`), [
			{
				_text: '*1*',
				style: 'bold',
				type: 'text',
				value: '1'
			}
		])
	})

	it('recon mixed emphasis', () => {
		assert.deepEqual(
			tokenize(
				"[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~, the round pegs in the +round+ square holes..."
			),
			[
				{
					_text: '[',
					element: 'link',
					type: 'opening'
				},
				{
					_text: '[https://github.com/xiaoxinghu/orgajs]',
					protocol: 'https',
					search: undefined,
					type: 'link.path',
					value: 'https://github.com/xiaoxinghu/orgajs'
				},
				{
					_text: "Here's",
					type: 'text',
					value: "Here's"
				},
				{
					_text: ']',
					element: 'link',
					type: 'closing'
				},
				{
					_text: ' to the ',
					type: 'text',
					value: ' to the '
				},
				{
					_text: '*crazy*',
					style: 'bold',
					type: 'text',
					value: 'crazy'
				},
				{
					_text: ' ones, the ',
					type: 'text',
					value: ' ones, the '
				},
				{
					_text: '/misfits/',
					style: 'italic',
					type: 'text',
					value: 'misfits'
				},
				{
					_text: ', the ',
					type: 'text',
					value: ', the '
				},
				{
					_text: '_rebels_',
					style: 'underline',
					type: 'text',
					value: 'rebels'
				},
				{
					_text: ', the ',
					type: 'text',
					value: ', the '
				},
				{
					_text: '~troublemakers~',
					style: 'code',
					type: 'text',
					value: 'troublemakers'
				},
				{
					_text: ', the round pegs in the ',
					type: 'text',
					value: ', the round pegs in the '
				},
				{
					_text: '+round+',
					style: 'strikeThrough',
					type: 'text',
					value: 'round'
				},
				{
					_text: ' square holes...',
					type: 'text',
					value: ' square holes...'
				}
			]
		)
	})

	it('can handle something more complicated', () => {
		const content = `
Special characters =~= and =!=. Also =~/.this/path= and ~that~ thing.
`

		assert.deepEqual(tokenize(content), [
			{
				_text: '',
				type: 'emptyLine'
			},
			{
				_text: '\n',
				type: 'newline'
			},
			{
				_text: 'Special characters ',
				type: 'text',
				value: 'Special characters '
			},
			{
				_text: '=~=',
				style: 'verbatim',
				type: 'text',
				value: '~'
			},
			{
				_text: ' and ',
				type: 'text',
				value: ' and '
			},
			{
				_text: '=!=',
				style: 'verbatim',
				type: 'text',
				value: '!'
			},
			{
				_text: '. Also ',
				type: 'text',
				value: '. Also '
			},
			{
				_text: '=~/.this/path=',
				style: 'verbatim',
				type: 'text',
				value: '~/.this/path'
			},
			{
				_text: ' and ',
				type: 'text',
				value: ' and '
			},
			{
				_text: '~that~',
				style: 'code',
				type: 'text',
				value: 'that'
			},
			{
				_text: ' thing.',
				type: 'text',
				value: ' thing.'
			},
			{
				_text: '\n',
				type: 'newline'
			}
		])
	})
})
