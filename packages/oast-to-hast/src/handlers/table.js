import { all } from '../transform'

export function table(h, node) { return h(node, 'table', all(h, node)) }
export function tableRow(h, node) { return h(node, 'tr', all(h, node)) }
export function tableCell(h, node) { return h(node, 'td', all(h, node)) }
