import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize list item', () => {
  it('knows list items', () => {
    // unordered
    assert.deepEqual(tokenize('- buy milk'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: 'buy milk', type: 'text', value: 'buy milk' },
    ])
    assert.deepEqual(tokenize('+ buy milk'), [
      { _text: '+', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: 'buy milk', type: 'text', value: 'buy milk' },
    ])
    // ordered
    assert.deepEqual(tokenize('1. buy milk'), [
      { _text: '1.', indent: 0, ordered: true, type: 'list.item.bullet' },
      { _text: 'buy milk', type: 'text', value: 'buy milk' },
    ])
    assert.deepEqual(tokenize('12. buy milk'), [
      {
        _text: '12.',
        indent: 0,
        ordered: true,
        type: 'list.item.bullet',
      },
      {
        _text: 'buy milk',
        type: 'text',
        value: 'buy milk',
      },
    ])
    assert.deepEqual(tokenize('123) buy milk'), [
      {
        _text: '123)',
        indent: 0,
        ordered: true,
        type: 'list.item.bullet',
      },
      {
        _text: 'buy milk',
        type: 'text',
        value: 'buy milk',
      },
    ])
    // checkbox
    assert.deepEqual(tokenize('- [x] buy milk checked'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: '[x]', checked: true, type: 'list.item.checkbox' },
      { _text: 'buy milk checked', type: 'text', value: 'buy milk checked' },
    ])
    assert.deepEqual(tokenize('- [X] buy milk checked'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: '[X]', checked: true, type: 'list.item.checkbox' },
      { _text: 'buy milk checked', type: 'text', value: 'buy milk checked' },
    ])
    assert.deepEqual(tokenize('- [-] buy milk checked'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: '[-]', checked: true, type: 'list.item.checkbox' },
      { _text: 'buy milk checked', type: 'text', value: 'buy milk checked' },
    ])
    assert.deepEqual(tokenize('- [ ] buy milk unchecked'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: '[ ]', checked: false, type: 'list.item.checkbox' },
      {
        _text: 'buy milk unchecked',
        type: 'text',
        value: 'buy milk unchecked',
      },
    ])
    // indent
    assert.deepEqual(tokenize('  - buy milk'), [
      { _text: '-', indent: 2, ordered: false, type: 'list.item.bullet' },
      { _text: 'buy milk', type: 'text', value: 'buy milk' },
    ])
    // tag
    assert.deepEqual(tokenize('- item1 :: description here'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: 'item1', type: 'list.item.tag', value: 'item1' },
      {
        _text: 'description here',
        type: 'text',
        value: 'description here',
      },
    ])
    assert.deepEqual(tokenize('- item2\n :: description here'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: 'item2', type: 'text', value: 'item2' },
      { _text: '\n', type: 'newline' },
      {
        _text: ' :: description here',
        type: 'text',
        value: ' :: description here',
      },
    ])
    assert.deepEqual(tokenize('- [x] item3 :: description here'), [
      { _text: '-', indent: 0, ordered: false, type: 'list.item.bullet' },
      { _text: '[x]', checked: true, type: 'list.item.checkbox' },
      { _text: 'item3', type: 'list.item.tag', value: 'item3' },
      {
        _text: 'description here',
        type: 'text',
        value: 'description here',
      },
    ])
  })

  it('knows these are not list items', () => {
    assert.deepEqual(tokenize('-not item'), [
      { _text: '-not item', type: 'text', value: '-not item' },
    ])
    assert.deepEqual(tokenize('1.not item'), [
      { _text: '1.not item', type: 'text', value: '1.not item' },
    ])
    assert.deepEqual(tokenize('8)not item'), [
      { _text: '8)not item', type: 'text', value: '8)not item' },
    ])
    assert.deepEqual(tokenize('8a) not item'), [
      { _text: '8a) not item', type: 'text', value: '8a) not item' },
    ])
  })
})
