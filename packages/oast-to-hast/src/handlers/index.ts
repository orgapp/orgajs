import { Node } from 'unist'
import { Context, HNode } from '../'
import keyword from './keyword'
import block from './block'
import { footnote, footnoteReference } from './footnote'
import headline from './headline'
import html from './html'
import link from './link'
import list, { checkbox as listItemCheckbox, item as listItem } from './list'
import paragraph from './paragraph'
import section from './section'
import { table, tableCell, tableRow } from './table'
import { bold, code, italic, strikeThrough, underline, verbatim } from './text'

export type Handler = (context: Context) => (node: Node) => HNode

export default {
  keyword,
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
  priority: () => () => undefined,
  html,
} as { [key: string]: Handler }
