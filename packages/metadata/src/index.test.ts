import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import parse from '.'

describe('metadata parser', () => {
  it('works', () => {
    assert.deepEqual(parse('#+title: hello world'), {
      title: 'hello world',
    })
  })

  it('can handle multiple entries', () => {
    assert.deepEqual(
      parse(`
#+include: file1.org
#+include: ../file2.org
`),
      {
        include: ['file1.org', '../file2.org'],
      }
    )
  })

  it('can handle spaces at the front', () => {
    assert.deepEqual(
      parse(`
#+title: orga
#+keywords: parser ast
`),
      {
        title: 'orga',
        keywords: 'parser ast',
      }
    )
  })

  it('transform keys to lowercase', () => {
    assert.deepEqual(
      parse(`
#+TODO: TODO NEXT | DONE
#+todo: DRAFT | PUBLISHED
`),
      {
        todo: ['TODO NEXT | DONE', 'DRAFT | PUBLISHED'],
      }
    )
  })

  it('strips quotes if necessary', () => {
    assert.deepEqual(
      parse(`
#+include: "./file1.org"
#+include: './file2.org'
#+desc: it's good
`),
      {
        include: ['./file1.org', './file2.org'],
        desc: "it's good",
      }
    )
  })
})
