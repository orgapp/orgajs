import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize headline', () => {
  it('knows headlines', () => {
    assert.deepEqual(tokenize('** a headline'), [
      { _text: '** ', level: 2, type: 'stars' },
      { _text: 'a headline', type: 'text', value: 'a headline' },
    ])

    assert.deepEqual(tokenize('** _headline_'), [
      { _text: '** ', level: 2, type: 'stars' },
      {
        _text: '_headline_',
        style: 'underline',
        type: 'text',
        value: 'headline',
      },
    ])

    assert.deepEqual(tokenize('**   a headline'), [
      { _text: '**   ', level: 2, type: 'stars' },
      { _text: 'a headline', type: 'text', value: 'a headline' },
    ])

    assert.deepEqual(tokenize('***** a headline'), [
      { _text: '***** ', level: 5, type: 'stars' },
      { _text: 'a headline', type: 'text', value: 'a headline' },
    ])

    assert.deepEqual(tokenize('* a 😀line'), [
      { _text: '* ', level: 1, type: 'stars' },
      { _text: 'a 😀line', type: 'text', value: 'a 😀line' },
    ])

    assert.deepEqual(tokenize('* TODO [#A] a headline     :tag1:tag2:'), [
      { _text: '* ', level: 1, type: 'stars' },
      {
        _text: 'TODO ',
        actionable: true,
        keyword: 'TODO',
        type: 'todo',
      },
      { _text: '[#A] ', type: 'priority', value: '[#A]' },
      { _text: 'a headline', type: 'text', value: 'a headline' },
      {
        _text: ':tag1:tag2:',
        tags: ['tag1', 'tag2'],
        type: 'tags',
      },
    ])

    assert.deepEqual(
      tokenize(
        '* TODO [#A] a headline :tag1:123:#hash:@at:org-mode:under_score:98%:'
      ),
      [
        { _text: '* ', level: 1, type: 'stars' },
        {
          _text: 'TODO ',
          actionable: true,
          keyword: 'TODO',
          type: 'todo',
        },
        { _text: '[#A] ', type: 'priority', value: '[#A]' },
        { _text: 'a headline', type: 'text', value: 'a headline' },
        {
          _text: ':tag1:123:#hash:@at:org-mode:under_score:98%:',
          tags: [
            'tag1',
            '123',
            '#hash',
            '@at',
            'org-mode',
            'under_score',
            '98%',
          ],
          type: 'tags',
        },
      ]
    )
  })

  it('knows these are not headlines', () => {
    assert.deepEqual(tokenize('*not a headline'), [
      { _text: '*not a headline', type: 'text', value: '*not a headline' },
    ])

    assert.deepEqual(tokenize(' * not a headline'), [
      { _text: ' * not a headline', type: 'text', value: ' * not a headline' },
    ])
    assert.deepEqual(tokenize('*_* not a headline'), [
      { _text: '*_*', style: 'bold', type: 'text', value: '_' },
      { _text: ' not a headline', type: 'text', value: ' not a headline' },
    ])
    assert.deepEqual(tokenize('not a headline'), [
      { _text: 'not a headline', type: 'text', value: 'not a headline' },
    ])
  })
})
