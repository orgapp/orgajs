import { JSX } from 'orga'
import { Node } from 'unist'
import { Context, HNode } from '../index.js'
import block from './block.js'
import latex from './latex.js'
import { footnote, footnoteReference } from './footnote.js'
import headline from './headline.js'
import html from './html.js'
import keyword from './keyword.js'
import link from './link.js'
import list, { checkbox as listItemCheckbox, item as listItem } from './list.js'
import paragraph from './paragraph.js'
import section from './section.js'
import { table, tableCell, tableRow } from './table.js'
import text from './text.js'

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
  latex,
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
  jsx: (n: JSX, { u }) => u('jsx', { value: n.value }),
  'link.path': ignore,
  drawer: ignore,
  priority: ignore,
  planning: ignore,
  'table.seperator': ignore,
} as { [key: string]: Handler }
