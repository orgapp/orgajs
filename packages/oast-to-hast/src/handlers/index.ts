import root from './root'
import section from './section'
import headline from './headline'
import block from './block'
import link from './link'
import {
  bold,
  italic,
  code,
  underline,
  verbatim,
  strikeThrough,
} from './emphasis'
import list from './list'
import listItem from './listItem'
import { table, tableRow, tableCell } from './table'
import horizontalRule from './horizontal-rule'
import html from './html'
import paragraph from './paragraph'

import {
  definition as fnDef,
  reference as fnRef,
} from './footnote'


export default {
  root,
  section,
  headline,
  paragraph,
  block,
  link,
  bold,
  italic,
  code,
  underline,
  verbatim,
  strikeThrough,
  list,
  "list.item": listItem,
  table,
  "table.row": tableRow,
  "table.cell": tableCell,
  horizontalRule,
  html,
  "footnote.definition": fnDef,
  "footnote.reference": fnRef,
  drawer: () => undefined,
}
