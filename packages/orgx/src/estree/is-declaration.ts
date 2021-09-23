import { Declaration, BaseNode } from 'estree'

export default function isDeclaration(node: BaseNode): node is Declaration {
  const type = node && typeof node === 'object' && node.type
  return Boolean(
    type === 'FunctionDeclaration' ||
      type === 'ClassDeclaration' ||
      type === 'VariableDeclaration'
  )
}
