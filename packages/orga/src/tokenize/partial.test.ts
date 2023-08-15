import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('partial tokenize', () => {
  it('can start from the middle', () => {
    assert.deepEqual(tokenize('a b c', { range: { start: 2 } }), [
      { type: 'text', value: 'b c', _text: 'b c' },
    ])
  })
})
