import test from 'node:test'
import * as assert from 'node:assert'
import { toProse } from '../lib/index.js'

test('test', () => {
  const oast = {
    type: 'document',
    children: [
      {
        type: 'emptyLine',
      },
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', value: 'hello world' },
              {
                type: 'newline',
              },
              {
                type: 'emptyLine',
              },
            ],
          },
        ],
      },
    ],
  }
  const prose = toProse(oast)
  console.log({ prose })
  assert.strictEqual(1, 1)
})
