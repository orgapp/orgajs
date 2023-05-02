import { describe, it } from 'node:test'
import assert from 'node:assert'
import todoKeywordSet from './todo-keyword-set'

const debug = (text: string) => {
  const tks = todoKeywordSet(text)
  console.log(`${text}:`, tks)
}

describe('TodoKeywordSet', () => {
  it('works', () => {
    assert.deepEqual(todoKeywordSet('TODO | DONE'), {
      actionables: ['TODO'],
      done: ['DONE'],
      keywords: ['TODO', 'DONE'],
    })
    assert.deepEqual(todoKeywordSet('TODO DONE'), {
      actionables: ['TODO'],
      done: ['DONE'],
      keywords: ['TODO', 'DONE'],
    })
    assert.deepEqual(todoKeywordSet(' TODO NEXT  |  DONE '), {
      actionables: ['TODO', 'NEXT'],
      done: ['DONE'],
      keywords: ['TODO', 'NEXT', 'DONE'],
    })
    assert.deepEqual(todoKeywordSet('TODO NEXT DONE'), {
      actionables: ['TODO', 'NEXT'],
      done: ['DONE'],
      keywords: ['TODO', 'NEXT', 'DONE'],
    })
    assert.deepEqual(todoKeywordSet('TODO | DONE CANCELLED'), {
      actionables: ['TODO'],
      done: ['DONE', 'CANCELLED'],
      keywords: ['TODO', 'DONE', 'CANCELLED'],
    })
  })
})
