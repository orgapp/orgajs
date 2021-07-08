import { push, pushMany } from '../node'
import { Lexer } from '../tokenize'
import {
  FootnoteReference,
  Link,
  StyledText,
  Table,
  TableRow,
  TableRule,
  TableCell
} from '../types'
import utils, * as ast from './utils';
import footnoteReference from './footnoteReference';
import link from './link';
import textMarkup from './textMarkup';

export default (lexer: Lexer): Table | undefined => {
  const { peek, eat } = lexer

  const { tryMany, tryTo } = utils(lexer);

  const token = peek()
  if (!token || !token.type.startsWith('table.')) return undefined

  const getCell = (): TableCell => {
    const t = peek()
    const c = ast.tableCell([]);
    if (!t || t.type === 'newline') return;
    if (t.type === 'table.columnSeparator') return c;
    const contents = tryMany<FootnoteReference | Link | StyledText>([
      // entity, // not yet implemented
      // exportSnippet, // not yet implemented
      footnoteReference,
      link,
      // macro, // not yet implemented
      // radioTarget, // not yet implemented
      // target, // not yet implemented
      // subscript, // not yet implemented
      // superscript, // not yet implemented
      // superscript, // not yet implemented
      // timestamp, // not yet implemented
      textMarkup,
    ]);
    pushMany(c)(contents);
    return c;
  }

  const getRow = (row: TableRow = undefined): TableRow | TableRule => {
    const t = peek()
    if (!t) {
      return row
    }
    if (t.type === 'table.hr' && row === undefined) {
      eat()
      return t
    }
    if (t.type === 'table.columnSeparator') {
      eat('table.columnSeparator')
      const _row = row || ast.tableRow([]);
      tryTo(getCell)(push(_row));
      return getRow(_row)
    }
    return row
  }

  const parse = (table: Table = undefined): Table => {
    const row = getRow()
    if (!row) {
      return table
    }

    const _table = table || ast.table([]);

    push(_table)(row)
    eat('newline')
    return parse(_table)
  }

  return parse()

}
