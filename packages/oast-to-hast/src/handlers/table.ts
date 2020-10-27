import { Table, TableCell, TableRow } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'
import { Properties } from 'hast'

export const tableRow = (context: Context) => (node: TableRow): HNode => {
  return context.h('tr')(...all(context)(node.children))
}

export const tableCell = (context: Context) => (node: TableCell): HNode => {
  return context.h('td')(...all(context)(node.children))
}

export const table = (context: Context) => (node: Table): HNode => {
  const { h, u } = context

  return h('table', node.attributes.attr_html as Properties)(
    h('tbody')(...all(context)(node.children)),
    h('caption')(u('text', node.attributes.caption as string || ''))
  )
}
