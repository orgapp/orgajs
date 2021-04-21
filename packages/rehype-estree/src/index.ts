import { parse } from '@typescript-eslint/typescript-estree'
import hast2estree from 'hast-util-to-estree'
import { Transformer } from 'unified'
import { DEFAULT_OPTIONS, Handler, Options } from './options'
// import { Node as EstreeNode } from 'estree'

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

function rehype2estree (options: Partial<Options>): Transformer {
  return transformer

  function transformer(node) {
    let { space, jsx, parseRaw, handlers } = { ...DEFAULT_OPTIONS, ...options }

    for (const p of parseRaw) {
      const [key, ...rest] = p.split('.')
      if (!key) {
        throw new Error('somethings wrong')
      }
      const path = rest.length > 0 ? rest.join('.') : 'value'
      handlers[key] = getRawHandler({ path, jsx })
    }
    return hast2estree(node, { space, handlers })
  }
}

export = rehype2estree
