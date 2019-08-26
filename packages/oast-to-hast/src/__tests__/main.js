import u from 'unist-builder'
import toHAST from '..'
import { inspect } from 'util'

describe('Main', () => {
  it('POC', () => {
    const org = u('root', [
      u('section', { level: 1}, [
        u('headline', { level: 1, keyword: 'TODO', tags: ['shopping'] }, [
          u('text', 'remember the '),
          u('bold', [ u('text', 'milk') ])
        ]),
        u('paragraph', [
          u('text', 'This is a paragraph'),
          u('bold', [ u('text', 'something bold') ]),
          u('text', 'Some more text.'),
        ])
      ]),
      u('block', { name: 'SRC', params: ['javascript'] }, 'console.log("hello world")')
    ])

    expect(toHAST(org)).toMatchSnapshot()
  })

  it('can do list item', () => {
    const org = u('root', [
      u('list', { ordered: false, descriptive: true, }, [
        u('list.item', { tag: 'item1' }, [
          u('text', 'this is item 1'),
        ]),
        u('list.item', { tag: undefined }, [
          u('text', 'this is item 2'),
        ]),
      ]),
    ])

    expect(toHAST(org)).toMatchSnapshot()
  })

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

    console.log(inspect(toHAST(org), false, null, true))
    // expect(toHAST(org)).toMatchSnapshot()
  })
})
