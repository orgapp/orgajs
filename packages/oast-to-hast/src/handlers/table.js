import { all } from '../transform'

module.exports = {
  table: (h, node) => { return h(node, 'table', all(h, node)) },
  tableRow: (h, node) => { return h(node, 'tr', all(h, node)) },
  tableCell: (h, node) => { return h(node, 'td', all(h, node)) },
}
