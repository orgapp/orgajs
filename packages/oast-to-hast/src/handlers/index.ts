import { Comment, Element, Text } from 'hast'
import { Node } from 'unist'
import { Context } from '../'
import block from './block'
import { footnote, footnoteReference } from './footnote'
import headline from './headline'
import link from './link'
import list, { checkbox as listItemCheckbox, item as listItem } from './list'
import paragraph from './paragraph'
import section from './section'
import { table, tableCell, tableRow } from './table'
import { bold, code, italic, strikeThrough, underline, verbatim } from './text'

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
  html: ({ u }) => ({ value }) => u('raw', value),
} as { [key: string]: Handler }
