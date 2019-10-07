import u from 'unist-builder'
import toHAST from '..'
import { inspect } from 'util'

describe('Table', () => {

  it('can parse table', () => {
    const org = u('table', [
      u('table.row', [
        u('table.cell', [ u('text', 'name') ]),
        u('table.cell', [ u('text', 'gender') ]),
      ]),
      u('table.separator'),
      u('table.row', [
        u('table.cell', [ u('text', 'Superman') ]),
        u('table.cell', [ u('text', 'Male') ]),
      ]),
      u('table.row', [
        u('table.cell', [ u('text', 'Wonderwoman') ]),
        u('table.cell', [ u('text', 'Famale') ]),
      ]),
    ])

    expect(toHAST(org)).toMatchSnapshot()
  })

  it('can parse table with multiple headers', () => {
    const org = u('table', [
      u('table.row', [
        u('table.cell', [ u('text', 'name') ]),
        u('table.cell', [ u('text', 'gender') ]),
      ]),
      u('table.row', [
        u('table.cell', [ u('text', 'second') ]),
        u('table.cell', [ u('text', 'header') ]),
      ]),
      u('table.separator'),
      u('table.row', [
        u('table.cell', [ u('text', 'Superman') ]),
        u('table.cell', [ u('text', 'Male') ]),
      ]),
      u('table.row', [
        u('table.cell', [ u('text', 'Wonderwoman') ]),
        u('table.cell', [ u('text', 'Famale') ]),
      ]),
    ])

    // console.log(inspect(toHAST(org), false, null, true))
    expect(toHAST(org)).toMatchSnapshot()
  })

  it('can parse table with multiple separators (ignore the rest)', () => {
    const org = u('table', [
      u('table.row', [
        u('table.cell', [ u('text', 'name') ]),
        u('table.cell', [ u('text', 'gender') ]),
      ]),
      u('table.separator'),
      u('table.row', [
        u('table.cell', [ u('text', 'Superman') ]),
        u('table.cell', [ u('text', 'Male') ]),
      ]),
      u('table.separator'),
      u('table.row', [
        u('table.cell', [ u('text', 'Wonderwoman') ]),
        u('table.cell', [ u('text', 'Famale') ]),
      ]),
    ])

    // console.log(inspect(toHAST(org), false, null, true))
    expect(toHAST(org)).toMatchSnapshot()
  })
})
