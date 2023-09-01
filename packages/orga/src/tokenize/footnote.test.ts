import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize footnote', () => {
  it('knows footnotes', () => {
    assert.deepEqual(tokenize('[fn:1] a footnote'), [
      {
        _text: '[fn:1]',
        label: '1',
        type: 'footnote.label',
      },
      {
        _text: 'a footnote',
        type: 'text',
        value: 'a footnote',
      },
    ])
    assert.deepEqual(tokenize('[fn:word] a footnote'), [
      {
        _text: '[fn:word]',
        label: 'word',
        type: 'footnote.label',
      },
      {
        _text: 'a footnote',
        type: 'text',
        value: 'a footnote',
      },
    ])
    assert.deepEqual(tokenize('[fn:word_] a footnote'), [
      {
        _text: '[fn:word_]',
        label: 'word_',
        type: 'footnote.label',
      },
      {
        _text: 'a footnote',
        type: 'text',
        value: 'a footnote',
      },
    ])

    assert.deepEqual(tokenize('[fn:wor1d_] a footnote'), [
      {
        _text: '[fn:wor1d_]',
        label: 'wor1d_',
        type: 'footnote.label',
      },
      {
        _text: 'a footnote',
        type: 'text',
        value: 'a footnote',
      },
    ])
  })

  it('knows these are not footnotes', () => {
    assert.deepEqual(tokenize('[fn:1]: not a footnote'), [
      {
        _text: '[fn:',
        element: 'footnote.reference',
        type: 'opening',
      },
      {
        _text: '1',
        label: '1',
        type: 'footnote.label',
      },
      {
        _text: ']',
        element: 'footnote.reference',
        type: 'closing',
      },
      {
        _text: ': not a footnote',
        type: 'text',
        value: ': not a footnote',
      },
    ])
    assert.deepEqual(tokenize(' [fn:1] not a footnote with space prefix'), [
      {
        _text: ' ',
        type: 'text',
        value: ' ',
      },
      {
        _text: '[fn:',
        element: 'footnote.reference',
        type: 'opening',
      },
      {
        _text: '1',
        label: '1',
        type: 'footnote.label',
      },
      {
        _text: ']',
        element: 'footnote.reference',
        type: 'closing',
      },
      {
        _text: ' not a footnote with space prefix',
        type: 'text',
        value: ' not a footnote with space prefix',
      },
    ])

    assert.deepEqual(tokenize('[[fn:1] not a footnote with extra ['), [
      {
        _text: '[',
        type: 'text',
        value: '[',
      },
      {
        _text: '[fn:',
        element: 'footnote.reference',
        type: 'opening',
      },
      {
        _text: '1',
        label: '1',
        type: 'footnote.label',
      },
      {
        _text: ']',
        element: 'footnote.reference',
        type: 'closing',
      },
      {
        _text: ' not a footnote with extra [',
        type: 'text',
        value: ' not a footnote with extra [',
      },
    ])
    assert.deepEqual(tokenize('\t[fn:1] not a footnote with a tab prefix'), [
      {
        _text: '\t',
        type: 'text',
        value: '\t',
      },
      {
        _text: '[fn:',
        element: 'footnote.reference',
        type: 'opening',
      },
      {
        _text: '1',
        label: '1',
        type: 'footnote.label',
      },
      {
        _text: ']',
        element: 'footnote.reference',
        type: 'closing',
      },
      {
        _text: ' not a footnote with a tab prefix',
        type: 'text',
        value: ' not a footnote with a tab prefix',
      },
    ])
  })
})
