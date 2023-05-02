import { describe, it } from 'node:test'
import assert from 'node:assert'
import parse from './uri'

describe('Parsing Link', () => {
  it('recon local file', () => {
    assert.deepEqual(parse(`file:/hello.org`), {
      protocol: 'file',
      search: undefined,
      value: '/hello.org',
    })

    assert.deepEqual(parse(`./hello.org`), {
      protocol: 'file',
      search: undefined,
      value: './hello.org',
    })

    assert.deepEqual(parse(`./hello.org::23`), {
      protocol: 'file',
      search: 23,
      value: './hello.org',
    })
    assert.deepEqual(parse(`./hello.org::*shopping list`), {
      protocol: 'file',
      search: '*shopping list',
      value: './hello.org',
    })
    assert.deepEqual(parse(`./hello.org::apple pie`), {
      protocol: 'file',
      search: 'apple pie',
      value: './hello.org',
    })
  })

  it('recon other protocol', () => {
    assert.deepEqual(parse(`http://google.com`), {
      protocol: 'http',
      search: undefined,
      value: 'http://google.com',
    })
    assert.deepEqual(parse(`mailto:dawnstar.hu@gmail.com`), {
      protocol: 'mailto',
      search: undefined,
      value: 'dawnstar.hu@gmail.com',
    })
  })
})
