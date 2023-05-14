import { Declaration, Node } from 'estree-jsx'

export default function isDeclaration(node: Node): node is Declaration {
  const type = node && typeof node === 'object' && node.type
  return Boolean(
    type === 'FunctionDeclaration' ||
      type === 'ClassDeclaration' ||
      type === 'VariableDeclaration'
  )
}
