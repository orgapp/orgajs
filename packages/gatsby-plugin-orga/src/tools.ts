import type { Literal, BaseNode } from 'estree'
import type {
  JSXAttribute,
  JSXOpeningElement,
  JSXElement,
  JSXIdentifier,
} from 'estree-jsx'
import { URL } from 'url'

export function isExternalLink(path: string): boolean {
  try {
    new URL(path)
    return true
  } catch {
    return false
  }
}

export function isJSXOpeningElement(node: BaseNode): node is JSXOpeningElement {
  return node.type === 'JSXOpeningElement'
}

export function isJSXAttribute(node: BaseNode): node is JSXAttribute {
  return node.type === 'JSXAttribute'
}

export function isJSXElement(
  node: BaseNode,
  name?: string
): node is JSXElement {
  if (node.type !== 'JSXElement') return false
  if (!name) return true
  const e = node as JSXElement
  return (
    isJSXIdentifier(e.openingElement.name) &&
    e.openingElement.name.name === name
  )
}

export function isJSXIdentifier(node: BaseNode): node is JSXIdentifier {
  return node.type === 'JSXIdentifier'
}

export function isLiteral(node: BaseNode): node is Literal {
  return node.type === 'Literal'
}

export function isHref(node: BaseNode): node is JSXAttribute {
  return isJSXAttribute(node) && node.name.name === 'href'
}
