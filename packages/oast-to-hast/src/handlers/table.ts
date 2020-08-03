import { Table, TableCell, TableRow } from 'orga'
import { Context, HNode } from '../'
import { _all } from '../transform'

export const tableRow = (context: Context) => (node: TableRow): HNode => {
  return context.h('tr')(..._all(context)(node.children))
}

export const tableCell = (context: Context) => (node: TableCell): HNode => {
  return context.h('td')(..._all(context)(node.children))
}

export const table = (context: Context) => (node: Table): HNode => {
  const { h } = context

  return h('table')(
    h('tbody')(..._all(context)(node.children))
  )
}
