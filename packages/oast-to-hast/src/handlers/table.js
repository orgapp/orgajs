import u from 'unist-builder'
import { all } from '../transform'

export function table(h, node) {

  const rows = node.children
  const separatorIndex = rows.findIndex(row => row.type === `table.separator`)

  let result = []

  if (separatorIndex > 0) {
    result.push(
      h(node, 'thead',
        rows.slice(0, separatorIndex)
            .map(row => h(row, 'tr', all(h, { ...row, isHeader: true }))))
    )
  }

  result.push(
    h(node, 'tbody',
      rows.slice(separatorIndex + 1)
          .filter(row => row.type === `table.row`)
          .map(row => h(row, 'tr', all(h, row))))
  )


  // console.log(rows)

  // return u('table', result)
  return h(node, 'table', result)
}
export function tableRow(h, node) { return h(node, 'tr', all(h, node)) }
export function tableCell(h, node, parent) { return h(node, parent.isHeader ? 'th' : 'td', all(h, node)) }
