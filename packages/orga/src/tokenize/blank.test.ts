import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize blanks', () => {
  it('could handle blanks', () => {
    assert.deepEqual(tokenize(''), [])
    assert.deepEqual(tokenize(' '), [
      {
        _text: ' ',
        type: 'emptyLine',
      },
    ])
    assert.deepEqual(tokenize('    '), [
      {
        _text: '    ',
        type: 'emptyLine',
      },
    ])
    assert.deepEqual(tokenize('\t'), [
      {
        _text: '\t',
        type: 'emptyLine',
      },
    ])
    assert.deepEqual(tokenize(' \t'), [
      {
        _text: ' \t',
        type: 'emptyLine',
      },
    ])
    assert.deepEqual(tokenize('\t '), [
      {
        _text: '\t ',
        type: 'emptyLine',
      },
    ])
    assert.deepEqual(tokenize(' \t  '), [
      {
        _text: ' \t  ',
        type: 'emptyLine',
      },
    ])
  })

  it('knows these are not blanks', () => {
    assert.deepEqual(tokenize(' a '), [
      {
        _text: 'a ',
        type: 'text',
        value: 'a ',
      },
    ])
  })
})
