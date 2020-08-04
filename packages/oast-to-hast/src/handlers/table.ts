import { Table, TableCell, TableRow } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

export const tableRow = (context: Context) => (node: TableRow): HNode => {
  return context.h('tr')(...all(context)(node.children))
}

export const tableCell = (context: Context) => (node: TableCell): HNode => {
  return context.h('td')(...all(context)(node.children))
}

export const table = (context: Context) => (node: Table): HNode => {
  const { h } = context

  return h('table')(
    h('tbody')(...all(context)(node.children))
  )
}
