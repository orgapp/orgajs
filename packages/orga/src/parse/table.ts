import { push } from '../node'
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
import {
  andThen2d,
  map,
  oneOf,
} from './utils';
import footnoteReference from './footnoteReference';
import link from './link';
import textMarkup from './textMarkup';
import { Position } from 'unist';

export default (lexer: Lexer): Table | undefined => {
  const { peek, eat } = lexer

  const { tryMany, trySome } = utils(lexer);

  const token = peek()
  if (!token || !token.type.startsWith('table.')) return undefined

  const getCell = (start: Position): TableCell => {
    let t = peek()
    if (!t || t.type === 'newline') return;
    const c = ast.tableCell([], { position: start });
    tryMany<FootnoteReference | Link | StyledText>([
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
    ])(push(c));

    // check for end of cell to get end-of-cell position
    t = peek();
    if (t.type === 'table.columnSeparator') {
      c.position.end = t.position.end;
    };

    return c;
  }

  const tableRule = (): TableRule => {
    const t = peek();
    if (t && t.type === 'table.hr') {
      return t;
    }
  };

  const tRow = (): TableRow => {
    const aColSep = () => {
      const t = peek();
      if (t && t.type === 'table.columnSeparator') {
        eat();
        return t;
      }
    };
    const aCol = oneOf<TableCell | 'eor'>([andThen2d(aColSep, colSep => () =>
      getCell(colSep.position)
    ), map(_ => 'eor', aColSep)]);

    const row = ast.tableRow([]);
    if (trySome(aCol)(c => {
      if (!(c === 'eor')) {
        push(row)(c);
      }
    })) {
      return row;
    }
  };

  const tableRow = oneOf<TableRow | TableRule>([tableRule, tRow]);

  const table = ast.table([]);
  if (trySome(tableRow)(push(table), _ => eat('newline'))) {
    return table;
  }
}
