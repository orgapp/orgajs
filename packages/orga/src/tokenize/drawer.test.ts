import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize drawer', () => {
  it('knows drawer begins', () => {
    assert.deepEqual(tokenize(':PROPERTIES:'), [
      {
        _text: ':PROPERTIES:',
        name: 'PROPERTIES',
        type: 'drawer.begin',
      },
    ])
    assert.deepEqual(tokenize('  :properties:'), [
      {
        _text: ':properties:',
        name: 'properties',
        type: 'drawer.begin',
      },
    ])
    assert.deepEqual(tokenize('  :properties:  '), [
      {
        _text: ':properties:',
        name: 'properties',
        type: 'drawer.begin',
      },
    ])
    assert.deepEqual(tokenize('  :prop_erties:  '), [
      {
        _text: ':prop_erties:',
        name: 'prop_erties',
        type: 'drawer.begin',
      },
    ])
  })

  it('knows these are not drawer begins', () => {
    assert.deepEqual(tokenize('PROPERTIES:'), [
      {
        _text: 'PROPERTIES:',
        type: 'text',
        value: 'PROPERTIES:',
      },
    ])
    assert.deepEqual(tokenize(':PROPERTIES'), [
      {
        _text: ':PROPERTIES',
        type: 'text',
        value: ':PROPERTIES',
      },
    ])
    assert.deepEqual(tokenize(':PR OPERTIES:'), [
      {
        _text: ':PR OPERTIES:',
        type: 'text',
        value: ':PR OPERTIES:',
      },
    ])
  })

  it('knows drawer ends', () => {
    assert.deepEqual(tokenize(':END:'), [
      {
        _text: ':END:',
        type: 'drawer.end',
      },
    ])
    assert.deepEqual(tokenize('  :end:'), [
      {
        _text: ':end:',
        type: 'drawer.end',
      },
    ])
    assert.deepEqual(tokenize('  :end:  '), [
      {
        _text: ':end:',
        type: 'drawer.end',
      },
    ])
    assert.deepEqual(tokenize('  :end:  '), [
      {
        _text: ':end:',
        type: 'drawer.end',
      },
    ])
  })

  it('knows these are not drawer ends', () => {
    assert.deepEqual(tokenize('END:'), [
      {
        _text: 'END:',
        type: 'text',
        value: 'END:',
      },
    ])
    assert.deepEqual(tokenize(':END'), [
      {
        _text: ':END',
        type: 'text',
        value: ':END',
      },
    ])
    assert.deepEqual(tokenize(':ENDed'), [
      {
        _text: ':ENDed',
        type: 'text',
        value: ':ENDed',
      },
    ])
  })
})
