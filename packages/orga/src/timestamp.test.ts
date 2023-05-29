import { describe, it } from 'node:test'
import { parse } from './timestamp'
import assert from 'node:assert'

const p = (text: string) => {
  return parse(text, { timezone: 'Pacific/Auckland' })
}

describe('timestamp', () => {
  it('can parse timestamps', () => {
    assert.deepEqual(p('[2021-04-24 Sat]'), {
      date: new Date('2021-04-23T12:00:00.000Z'),
      end: undefined,
    })
    assert.deepEqual(p('<2021-04-24 Sat>'), {
      date: new Date('2021-04-23T12:00:00.000Z'),
      end: undefined,
    })
    assert.deepEqual(p('<2021-04-24 Sat 19:15>'), {
      date: new Date('2021-04-24T07:15:00.000Z'),
      end: undefined,
    })
    assert.deepEqual(p('<2021-04-24 Sat 19:15-22:00>'), {
      date: new Date('2021-04-24T07:15:00.000Z'),
      end: new Date('2021-04-24T10:00:00.000Z'),
    })
    assert.deepEqual(p('<2019-08-19 Mon>--<2019-08-20 Tue>'), {
      date: new Date('2019-08-18T12:00:00.000Z'),
      end: new Date('2019-08-19T12:00:00.000Z'),
    })
  })
})
