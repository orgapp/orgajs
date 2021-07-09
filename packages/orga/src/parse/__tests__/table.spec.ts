import debug from './debug'
import {
  footnoteReference,
  paragraph,
  table,
  tableCell,
  tableRow,
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
