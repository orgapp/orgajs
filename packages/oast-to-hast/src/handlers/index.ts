import { Node } from 'unist'
import { Context, HNode } from '../'
import block from './block'
import { footnote, footnoteReference } from './footnote'
import headline from './headline'
import html from './html'
import keyword from './keyword'
import link from './link'
import list, { checkbox as listItemCheckbox, item as listItem } from './list'
import paragraph from './paragraph'
import section from './section'
import { table, tableCell, tableRow } from './table'
import text from './text'

// export type Handler = (context: Context) => (node: Node) => HNode
export type Handler = (
  node: Node,
  context: Context
) => HNode | Handler | undefined

const ignore: Handler = () => undefined

export default {
  keyword,
  section,
  headline,
  text,
  newline: (_, { u }) => u('text', ' '),
  paragraph,
  link,
  block,
  list,
  'list.item': listItem,
  'list.item.tag': ignore,
  'list.item.bullet': ignore,
  'list.item.checkbox': listItemCheckbox,
  table,
  'table.row': tableRow,
  'table.cell': tableCell,
  footnote,
  'footnote.reference': footnoteReference,
  hr: (_, { h }) => h('hr')(),
  html,
  jsx: (n, { u }) => u('jsx', { value: n.value }),
  'link.path': ignore,
  drawer: ignore,
  priority: ignore,
  planning: ignore,
  'table.seperator': ignore,
} as { [key: string]: Handler }
