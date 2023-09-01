import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize comment', () => {
  it('knows comments', () => {
    assert.deepEqual(tokenize('# a comment'), [
      {
        _text: '# a comment',
        type: 'comment',
        value: 'a comment',
      },
    ])
    assert.deepEqual(tokenize('# '), [
      {
        _text: '# ',
        type: 'comment',
        value: '',
      },
    ])
    assert.deepEqual(tokenize('# a comment😯'), [
      {
        _text: '# a comment😯',
        type: 'comment',
        value: 'a comment😯',
      },
    ])
    assert.deepEqual(tokenize(' # a comment'), [
      {
        _text: '# a comment',
        type: 'comment',
        value: 'a comment',
      },
    ])
    assert.deepEqual(tokenize('  \t  # a comment'), [
      {
        _text: '# a comment',
        type: 'comment',
        value: 'a comment',
      },
    ])
    assert.deepEqual(tokenize('#   a comment'), [
      {
        _text: '#   a comment',
        type: 'comment',
        value: 'a comment',
      },
    ])
    assert.deepEqual(tokenize('#    \t a comment'), [
      {
        _text: '#    	 a comment',
        type: 'comment',
        value: 'a comment',
      },
    ])
  })

  it('knows these are not comments', () => {
    assert.deepEqual(tokenize('#not a comment'), [
      {
        _text: '#not a comment',
        type: 'text',
        value: '#not a comment',
      },
    ])
    assert.deepEqual(tokenize('  #not a comment'), [
      {
        _text: '  #not a comment',
        type: 'text',
        value: '  #not a comment',
      },
    ])
  })
})
