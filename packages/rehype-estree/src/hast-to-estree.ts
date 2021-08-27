import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { Node as HastNode } from 'hast'
import hast2estree from 'hast-util-to-estree'
import { Handler, Options } from './options'

const deepGet = (p: string) => (o: any) =>
  p.split('.').reduce((a, v) => a[v], o)

const parse = (code: string) => {
  return Parser.extend(jsx()).parse(code, {
    sourceType: 'module',
    ecmaVersion: 2020,
  })
}

const getJSXHandler = ({
  path,
  skipImport,
}: {
  path: string
  skipImport: boolean
}) => {
  // @ts-ignore
  const handler: Handler = (node, context) => {
    const estree = parse(deepGet(path)(node))
    // @ts-ignore TODO: get rid of this
    const expressions = estree.body.filter((child) => {
      if (child.type === 'ImportDeclaration') {
        if (!skipImport) {
          context.esm.push(child)
        }
        return false
      }
      return true
    })

    return expressions
  }
  return handler
}

function toEstree(node: HastNode, options: Options) {
  const { space, skipImport, parseJSX, handlers } = options

  for (const p of parseJSX) {
    const [key, ...rest] = p.split('.')
    if (!key) {
      throw new Error('somethings wrong')
    }
    const path = rest.length > 0 ? rest.join('.') : 'value'
    handlers[key] = getJSXHandler({ path, skipImport })
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
            init: { type: 'Literal', value: value, raw: `'${value}'` },
          },
        ],
        kind: 'const',
      },
      specifiers: [],
      source: null,
      exportKind: 'value',
    }))
  }

  const estree = hast2estree(node, { space, handlers })
  if (exports) {
    estree.body = [...exports, ...estree.body]
  }

  return estree
}

export default toEstree
