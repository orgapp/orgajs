import { ExportNamedDeclaration, BaseNode, ExportDefaultDeclaration, ExpressionStatement, VariableDeclaration, Declaration } from 'estree'
import { JSXElement, JSXFragment } from 'estree-jsx'
import _ from 'lodash/fp'

export function isExportNamedDeclaration(node: BaseNode): node is ExportNamedDeclaration {
  return node.type === 'ExportNamedDeclaration'
}

export function isExportDefaultDeclaration(node: BaseNode): node is ExportDefaultDeclaration {
  return node.type === 'ExportDefaultDeclaration'
}

export function isExpressionStatement(node: BaseNode): node is ExpressionStatement {
  return node.type === 'ExpressionStatement'
}

export function isJSXExpression(node: BaseNode): node is ExpressionStatement {
  if (node.type !== 'ExpressionStatement') return false
  const expType = _.get('expression.type')(node)
  return expType === 'JSXElement' || expType === 'JSXFragment'
}

export function isJSXFragment(node: BaseNode): node is JSXFragment {
  return node.type === 'JSXFragment'
}

export function isJSXElement(node: BaseNode): node is JSXElement {
  return node.type === 'JSXElement'
}

export function isDeclaration(node: BaseNode): node is Declaration {
  return node.type === 'VariableDeclaration' || node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration'
}
