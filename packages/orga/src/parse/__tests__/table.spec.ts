import debug from './debug'
import {
  footnoteReference,
  paragraph,
  pos,
  section,
  table,
  tableCell,
  tableRow,
  testParse,
  testParseSection,
  text,
  textBold,
} from './util';

describe('Parse Table', () => {
  it('works', () => {
    const content = `
| Name         | Species    | Gender | Role         |
|--------------+------------+--------+--------------|
| Bruce Wayne  | Human      | M      | Batman       |
| Clark Kent   | [[https://en.wikipedia.org/wiki/Kryptonian][Kryptonian]] | M      | *Superman*   |
| Diana Prince | Amazonian  | F      | Wonder Woman |
`
    // debug(content)
  })

  testParseSection('single bar is row with no cells (org parser 2.4.4)', "|", [
    table([tableRow([])])
  ]);

  testParseSection('you can have an empty table cell', "||", [
    table([tableRow([tableCell([])])])
  ]);

  testParseSection('table can span multiple rows', "| row1 |\n| row2 |", [
    table([
      tableRow([tableCell([text(' row1 ')])]),
      tableRow([tableCell([text(' row2 ')])]),
    ])]);

  testParseSection('"Org tables end at the first line not starting with a vertical bar." - (spec v2021.07.03)', "| row1 |\n| row2 |\nnot row", [
    table([
      tableRow([tableCell([text(' row1 ')])]),
      tableRow([tableCell([text(' row2 ')])]),
    ]),
    paragraph([text('not row')]),
  ]);

  testParseSection('pipe not at start of line does not start a table', "not row |", [
    paragraph([text('not row |')]),
  ]);

  testParse('correct positions & parents', "| Test |\n| Test\nTest", [
    section([
      table([
        tableRow([
          tableCell([text(' Test ', {
            parent: { type: 'table.cell' } as any,
            position: pos([1, 2], [1, 8])
          })], {
            parent: { type: 'table.row' } as any,
            position: pos([1, 1], [1, 9]),
          })], {
          parent: { type: 'table' } as any,
          position: pos([1, 1], [1, 9]),
        }),
        tableRow([
          tableCell([text(' Test', {
            parent: { type: 'table.cell' } as any,
            position: pos([2, 2], [2, 7])
          })], {
            parent: { type: 'table.row' } as any,
            position: pos([2, 1], [2, 7]),
          })], {
          parent: { type: 'table' } as any,
          position: pos([2, 1], [2, 7]),
        }),
      ], {
        parent: { type: 'section' } as any,
        position: pos([1, 1], [2, 7]),
      }),
      paragraph([
        text('Test', {
          parent: { type: 'paragraph' } as any,
          position: pos([3, 1], [3, 5]),
        }),
      ], {
        parent: { type: 'section' } as any,
        position: pos([3, 1], [3, 5]),
      }),
    ], {
      parent: { type: 'document' } as any,
      position: pos([1, 1], [3, 5]),
    }),
  ], {
    position: pos([1, 1], [3, 5])
  });

  testParseSection('newline ends cell', "| test\nthere", [
    table([tableRow([tableCell([text(' test')])])]),
    paragraph([text('there')])
  ]);

  testParseSection('you can have text markup in cells', "| *markup* |", [
    table([tableRow([tableCell([text(" "), textBold("markup"), text(" ")])])])
  ]);

  testParseSection('pipe in markup starts new cell', "| *mark|up* |", [
    table([tableRow([tableCell([text(" *mark")]), tableCell([text("up* ")])])])]);

  testParseSection('you can have mixed markup and footnotes in cell', "| [fn:ref] *markup* |", [
    table([tableRow([tableCell([text(' '), footnoteReference('ref'), text(" "), textBold("markup"), text(" ")])])])
  ]);
})
