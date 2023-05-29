import { describe, it } from 'node:test'
import assert from 'node:assert'
import tokenize from './__tests__/tok'

const options = {
  timezone: 'Pacific/Auckland',
}

describe('tokenize planning', () => {
  it('knows plannings', () => {
    assert.deepEqual(tokenize('DEADLINE: <2018-01-01 Mon>', options), [
      {
        _text: 'DEADLINE:',
        type: 'planning.keyword',
        value: 'DEADLINE',
      },
      {
        _text: ' <2018-01-01 Mon>',
        type: 'planning.timestamp',
        value: {
          date: new Date('2017-12-31T11:00:00.000Z'),
          end: undefined,
        },
      },
    ])
    assert.deepEqual(tokenize('  DEADLINE: <2018-01-01 Mon>', options), [
      {
        _text: 'DEADLINE:',
        type: 'planning.keyword',
        value: 'DEADLINE',
      },
      {
        _text: ' <2018-01-01 Mon>',
        type: 'planning.timestamp',
        value: {
          date: new Date('2017-12-31T11:00:00.000Z'),
          end: undefined,
        },
      },
    ])
    assert.deepEqual(tokenize(' \tDEADLINE: <2018-01-01 Mon>', options), [
      {
        _text: 'DEADLINE:',
        type: 'planning.keyword',
        value: 'DEADLINE',
      },
      {
        _text: ' <2018-01-01 Mon>',
        type: 'planning.timestamp',
        value: {
          date: new Date('2017-12-31T11:00:00.000Z'),
          end: undefined,
        },
      },
    ])
    assert.deepEqual(tokenize(' \t DEADLINE: <2018-01-01 Mon>', options), [
      {
        _text: 'DEADLINE:',
        type: 'planning.keyword',
        value: 'DEADLINE',
      },
      {
        _text: ' <2018-01-01 Mon>',
        type: 'planning.timestamp',
        value: {
          date: new Date('2017-12-31T11:00:00.000Z'),
          end: undefined,
        },
      },
    ])
  })

  it('know multiple plannings', () => {
    assert.deepEqual(
      tokenize(
        'DEADLINE: <2020-07-03 Fri> SCHEDULED: <2020-07-03 Fri>',
        options
      ),
      [
        {
          _text: 'DEADLINE:',
          type: 'planning.keyword',
          value: 'DEADLINE',
        },
        {
          _text: ' <2020-07-03 Fri> ',
          type: 'planning.timestamp',
          value: {
            date: new Date('2020-07-02T12:00:00.000Z'),
            end: undefined,
          },
        },
        {
          _text: 'SCHEDULED:',
          type: 'planning.keyword',
          value: 'SCHEDULED',
        },
        {
          _text: ' <2020-07-03 Fri>',
          type: 'planning.timestamp',
          value: {
            date: new Date('2020-07-02T12:00:00.000Z'),
            end: undefined,
          },
        },
      ]
    )
  })

  it('knows these are not plannings', () => {
    assert.deepEqual(tokenize('dEADLINE: <2018-01-01 Mon>', options), [
      {
        _text: 'dEADLINE: <2018-01-01 Mon>',
        type: 'text',
        value: 'dEADLINE: <2018-01-01 Mon>',
      },
    ])
  })
})
