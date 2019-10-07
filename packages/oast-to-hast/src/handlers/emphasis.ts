import { all } from '../transform'

export function bold(h, node) { return h(node, 'strong', all(h, node)) }
export function italic(h, node) { return h(node, 'i', all(h, node)) }
export function code(h, node) { return h(node, 'code', all(h, node)) }
export function underline(h, node) { return h(node, 'u', all(h, node)) }
export function verbatim(h, node) { return h(node, 'code', all(h, node)) }
export function strikeThrough(h, node) { return h(node, 'del', all(h, node)) }
