import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

describe('tokenize table', () => {
  it('knows table hr', () => {
    assert.deepEqual(tokenize('|----+---+----|'), [
      { _text: '|----+---+----|', type: 'table.hr' },
    ])
    assert.deepEqual(tokenize('|--=-+---+----|'), [
      { _text: '|--=-+---+----|', type: 'table.hr' },
    ])
    assert.deepEqual(tokenize('  |----+---+----|'), [
      { _text: '|----+---+----|', type: 'table.hr' },
    ])
    assert.deepEqual(tokenize('|----+---+----'), [
      { _text: '|----+---+----', type: 'table.hr' },
    ])
    assert.deepEqual(tokenize('|---'), [{ _text: '|---', type: 'table.hr' }])
    assert.deepEqual(tokenize('|-'), [{ _text: '|-', type: 'table.hr' }])
  })

  it('knows these are not table separators', () => {
    assert.deepEqual(tokenize('----+---+----|'), [
      { _text: '----+---+----|', type: 'text', value: '----+---+----|' },
    ])
  })

  it('knows table rows', () => {
    assert.deepEqual(tokenize('| batman | superman | wonder woman |'), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' batman ',
        type: 'text',
        value: ' batman ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' superman ',
        type: 'text',
        value: ' superman ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' wonder woman ',
        type: 'text',
        value: ' wonder woman ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
    ])
    assert.deepEqual(tokenize("| hello | world | y'all |"), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' hello ',
        type: 'text',
        value: ' hello ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' world ',
        type: 'text',
        value: ' world ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: " y'all ",
        type: 'text',
        value: " y'all ",
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
    ])
    assert.deepEqual(tokenize("   | hello | world | y'all |"), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' hello ',
        type: 'text',
        value: ' hello ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' world ',
        type: 'text',
        value: ' world ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: " y'all ",
        type: 'text',
        value: " y'all ",
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
    ])
    assert.deepEqual(tokenize("|    hello |  world   |y'all |"), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: '    hello ',
        type: 'text',
        value: '    hello ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: '  world   ',
        type: 'text',
        value: '  world   ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: "y'all ",
        type: 'text',
        value: "y'all ",
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
    ])
    // with empty cell
    assert.deepEqual(tokenize('||  world   | |'), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: '  world   ',
        type: 'text',
        value: '  world   ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: ' ',
        type: 'text',
        value: ' ',
      },
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
    ])
  })

  it('knows these are not table rows', () => {
    assert.deepEqual(tokenize(" hello | world | y'all |"), [
      {
        _text: " hello | world | y'all |",
        type: 'text',
        value: " hello | world | y'all |",
      },
    ])
    assert.deepEqual(tokenize('|+'), [
      {
        _text: '|',
        type: 'table.columnSeparator',
      },
      {
        _text: '+',
        type: 'text',
        value: '+',
      },
    ])
  })
})
