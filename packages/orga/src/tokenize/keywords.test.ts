import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize keywords', () => {
  it('knows keywords', () => {
    assert.deepEqual(tokenize('#+KEY: Value'), [
      {
        _text: '#+KEY: Value',
        key: 'KEY',
        type: 'keyword',
        value: 'Value',
      },
    ])
    assert.deepEqual(tokenize('#+KEY: Another Value'), [
      {
        _text: '#+KEY: Another Value',
        key: 'KEY',
        type: 'keyword',
        value: 'Another Value',
      },
    ])
    assert.deepEqual(tokenize('#+KEY: value : Value'), [
      {
        _text: '#+KEY: value : Value',
        key: 'KEY',
        type: 'keyword',
        value: 'value : Value',
      },
    ])
  })

  it('knows these are not keywords', () => {
    assert.deepEqual(tokenize('#+KEY : Value'), [
      {
        _text: '#+KEY : Value',
        type: 'text',
        value: '#+KEY : Value',
      },
    ])
    assert.deepEqual(tokenize('#+KE Y: Value'), [
      {
        _text: '#+KE Y: Value',
        type: 'text',
        value: '#+KE Y: Value',
      },
    ])
  })
})
