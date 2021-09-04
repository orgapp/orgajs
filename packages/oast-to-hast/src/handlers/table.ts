import { Properties } from 'hast'
import { Table, TableCell, TableRow } from 'orga'
import { Context, HNode } from '../'

interface TableContext extends Context {
  isHead: boolean
}

export const tableRow = (node: TableRow, context: TableContext) => {
  const { h, all } = context
  return h('tr')(...all(node.children, context))
}

export const tableCell = (node: TableCell, context: TableContext) => {
  const { isHead, h, all } = context
  return h(isHead ? 'th' : 'td')(...all(node.children, context))
}

export const table = (node: Table, context: Context) => {
  const { h, u, all } = context

  const nodes: HNode[] = []
  let children = node.children

  let hrCount = 0
  while (children.length > 0) {
    const i = children.findIndex((n) => n.type === 'table.hr')
    const index = i > 0 ? i : children.length
    const chunk = children.slice(0, index)
    children = children.slice(index + 1)

    const isHead = hrCount === 0 && i > 0

    nodes.push(
      h(isHead ? 'thead' : 'tbody')(...all(chunk, { ...context, isHead }))
    )

    hrCount += 1
  }

  const tableProperties: Properties = {
    border: 2,
    cellspacing: 0,
    cellpadding: 6,
    rules: 'groups',
    frame: 'hsides',
    ...(node.attributes.attr_html as Properties),
  }

  return h('table', tableProperties)(
    ...nodes,
    h('caption')(u('text', (node.attributes.caption as string) || ''))
  )
}
