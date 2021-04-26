import { parse } from '@typescript-eslint/typescript-estree'
import { Node as HastNode } from 'hast'
import hast2estree from 'hast-util-to-estree'
import { Handler, Options } from './options'

const deepGet = (p: string) => (o: any) => p.split('.').reduce((a, v) => a[v], o)

const getRawHandler = ({ path, jsx }: { path: string, jsx: boolean }) => {
  const handler: Handler = (node, context) => {
    const estree = parse(deepGet(path)(node), { jsx })
    const expressions = estree.body.filter(child => {
      if (child.type === 'ImportDeclaration') {
        context.esm.push(child)
        return false
      }
      return true
    })

    return expressions
  }
  return handler
}

function toEstree(node: HastNode, options: Options) {
  const { space, jsx, parseRaw, handlers } = options

  for (const p of parseRaw) {
    const [key, ...rest] = p.split('.')
    if (!key) {
      throw new Error('somethings wrong')
    }
    const path = rest.length > 0 ? rest.join('.') : 'value'
    handlers[key] = getRawHandler({ path, jsx })
  }

  let exports

  if (node.type === 'root' && !!node.data) {
    const data = node.data

    exports = Object.entries(data).map(([key, value]) => ({
      type: 'ExportNamedDeclaration',
      declaration: {
        type: 'VariableDeclaration',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: { type: 'Identifier', name: key },
            init: { type: 'Literal', value: value, raw: `'${value}'` }
          }
        ],
        kind: 'const'
      },
      specifiers: [],
      source: null,
      exportKind: 'value'
    }
    ))
  }

  const estree = hast2estree(node, { space, handlers })
  if (exports) {
    estree.body = [
      ...exports,
      ...estree.body,
    ]
  }

  return estree

}

export default toEstree
