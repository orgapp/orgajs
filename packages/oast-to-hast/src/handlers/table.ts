import { Properties } from 'hast'
import { Table, TableCell, TableRow } from 'orga'
import { Context, HNode } from '../'
import { all } from '../transform'

interface TableContext extends Context {
  isHead: boolean
}

export const tableRow =
  (context: TableContext) =>
  (node: TableRow): HNode => {
    return context.h('tr')(...all(context)(node.children))
  }

export const tableCell =
  (context: TableContext) =>
  (node: TableCell): HNode => {
    const { isHead, h } = context
    return h(isHead ? 'th' : 'td')(...all(context)(node.children))
  }

export const table =
  (context: Context) =>
  (node: Table): HNode => {
    const { h, u } = context

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
        h(isHead ? 'thead' : 'tbody')(...all({ ...context, isHead })(chunk))
      )

      hrCount += 1
    }

    const tableProperties: Properties = {
      border: 2,
      cellspacing: 0,
      cellpadding: 6,
      rules: 'groups',
      frame: 'hsides',
      ...(node.attributes.attr_html as object),
    }

    return h('table', tableProperties)(
      ...nodes,
      h('caption')(u('text', (node.attributes.caption as string) || ''))
    )
  }
