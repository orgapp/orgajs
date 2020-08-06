import { Comment, Element, Text } from 'hast'
import { Node } from 'unist'
import { Context } from '../'
import block from './block'
import headline from './headline'
import link from './link'
import list, { checkbox as listItemCheckbox, item as listItem } from './list'
// import html from './html'
import paragraph from './paragraph'
import section from './section'
import { table, tableCell, tableRow } from './table'
import { bold, code, italic, strikeThrough, underline, verbatim } from './text'
import { footnoteReference, footnote } from './footnote'

export type Handler = (context: Context) => (node: Node) => Element | Comment | Text

export default {
  section,
  headline,
  'text.bold': bold,
  'text.italic': italic,
  'text.code': code,
  'text.verbatim': verbatim,
  'text.strikeThrough': strikeThrough,
  'text.underline': underline,
  paragraph,
  link,
  block,
  list,
  'list.item': listItem,
  'list.item.checkbox': listItemCheckbox,
  table,
  'table.row': tableRow,
  'table.cell': tableCell,
  footnote,
  'footnote.reference': footnoteReference,
  hr: ({ h }) => () => h('hr')(),
  drawer: () => () => undefined,
} as { [key: string]: Handler }

// export default {
//   root,
//   section,
//   headline,
//   paragraph,
//   block,
//   link,
//   bold,
//   italic,
//   code,
//   underline,
//   verbatim,
//   strikeThrough,
//   list,
//   "list.item": listItem,
//   table,
//   "table.row": tableRow,
//   "table.cell": tableCell,
//   horizontalRule,
//   html,
//   "footnote.definition": fnDef,
//   "footnote.reference": fnRef,
//   drawer: () => undefined,
// }
