import {
  BaseNode,
  BaseStatement,
  Declaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Expression,
  ExpressionStatement,
} from 'estree'
import { JSXElement, JSXFragment } from 'estree-jsx'
import _ from 'lodash'

export function isDeclaration(node: BaseNode): node is Declaration {
  return (
    node.type === 'VariableDeclaration' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ClassDeclaration'
  )
}

export function isExportNamedDeclaration(
  node: BaseNode
): node is ExportNamedDeclaration {
  return node.type === 'ExportNamedDeclaration'
}

export function isJSXElement(node: BaseNode): node is JSXElement {
  // To do: support members (`<x.y>`).
  return node.type === 'JSXElement'
  // && _.get('openingElement.name.type')(node) === 'JSXIdentifier'
}

export function isExportDefaultDeclaration(
  node: BaseNode
): node is ExportDefaultDeclaration {
  return node.type === 'ExportDefaultDeclaration'
}

interface JSXExpressionStatement extends BaseStatement {
  type: 'ExpressionStatement'
  expression: Expression | JSXElement | JSXFragment
}

export function isExpressionStatement(
  node: BaseNode
): node is JSXExpressionStatement {
  if (node.type !== 'ExpressionStatement') return false
  const expType = _.get(node, 'expression.type')
  return expType === 'JSXElement' || expType === 'JSXFragment'
}
