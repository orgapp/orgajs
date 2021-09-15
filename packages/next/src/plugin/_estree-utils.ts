import { Literal } from 'estree'
import { JSXAttribute, JSXOpeningElement } from 'estree-jsx'
import { BaseNode } from 'estree-walker'

export function isJSXOpeningElement(node: BaseNode): node is JSXOpeningElement {
  return node.type === 'JSXOpeningElement'
}

export function isJSXAttribute(node: BaseNode): node is JSXAttribute {
  return node.type === 'JSXAttribute'
}

export function isLiteral(node: BaseNode): node is Literal {
  return node.type === 'Literal'
}

export function isHref(node: BaseNode): node is JSXAttribute {
  return isJSXAttribute(node) && node.name.name === 'href'
}
