import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize hr', () => {
  it('knows horizontal rules', () => {
    assert.deepEqual(tokenize('-----'), [
      {
        _text: '-----',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('------'), [
      {
        _text: '------',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('--------'), [
      {
        _text: '--------',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('  -----'), [
      {
        _text: '-----',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('-----   '), [
      {
        _text: '-----   ',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('  -----   '), [
      {
        _text: '-----   ',
        type: 'hr',
      },
    ])
    assert.deepEqual(tokenize('  -----  \t '), [
      {
        _text: '-----  	 ',
        type: 'hr',
      },
    ])
  })

  it('knows these are not horizontal rules', () => {
    assert.deepEqual(tokenize('----'), [
      {
        _text: '----',
        type: 'text',
        value: '----',
      },
    ])
    assert.deepEqual(tokenize('- ----'), [
      {
        _text: '-',
        indent: 0,
        ordered: false,
        type: 'list.item.bullet',
      },
      {
        _text: '----',
        type: 'text',
        value: '----',
      },
    ])
    assert.deepEqual(tokenize('-----a'), [
      {
        _text: '-----a',
        type: 'text',
        value: '-----a',
      },
    ])
    assert.deepEqual(tokenize('_-----'), [
      {
        _text: '_-----',
        type: 'text',
        value: '_-----',
      },
    ])
    assert.deepEqual(tokenize('-----    a'), [
      {
        _text: '-----    a',
        type: 'text',
        value: '-----    a',
      },
    ])
  })
})
