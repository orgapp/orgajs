import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import { BaseExpression, Expression, Literal, Program } from 'estree-jsx'
import { Node as HastNode, Root } from 'hast'
import { toEstree } from 'hast-util-to-estree'
import type { Plugin } from 'unified'
import renderError from '../estree/error.js'
import removeQuotes from '../utils/remove-quotes.js'

const deepGet = (p: string) => (o: any) =>
  p.split('.').reduce((a, v) => a[v], o)

const parse = (code: string) => {
  try {
    return Parser.extend(jsx()).parse(code, {
      sourceType: 'module',
      ecmaVersion: 2020,
    })
  } catch (err) {
    return renderError(err)
  }
}

export type Handler = (
  node: HastNode,
  context: any
) => BaseExpression | BaseExpression[]

const defaultOptions = {
  space: 'html' as 'html' | 'svg',
  parseJSX: ['jsx.value'],
  skipImport: false,
  handlers: {} as Record<string, Handler>,
}

export type Options = {
  space: 'html' | 'svg'
  parseJSX: string[]
  skipImport: boolean
  handlers: Record<string, Handler>
}

export const rehypeEstree: Plugin = (options: Options) => {
  const { space, parseJSX, skipImport, handlers } = options

  for (const p of parseJSX) {
    const [key, ...rest] = p.split('.')
    if (!key) {
      throw new Error('somethings wrong')
    }
    const path = rest.length > 0 ? rest.join('.') : 'value'

    const getJSXHandler = ({
      path,
      skipImport,
    }: {
      path: string
      skipImport: boolean
    }) => {
      const handler: Handler = (node, context) => {
        const estree = parse(deepGet(path)(node)) as Program
        const expressions = []
        estree.body.forEach((child) => {
          if (child.type === 'ImportDeclaration') {
            if (!skipImport) {
              context.esm.push(child)
            }
            return false
          } else if (child.type === 'ExpressionStatement') {
            expressions.push(child.expression)
          } else if (
            child.type === 'ExportDefaultDeclaration' ||
            child.type === 'ExportNamedDeclaration'
          ) {
            context.esm.push(child)
          } else {
            throw new Error(`unexpected node: ${child.type}`)
          }
        })

        return expressions
      }
      return handler
    }

    handlers[key] = getJSXHandler({ path, skipImport })
  }

  return (tree: Root) => {
    const data = tree.data || {}
    const estree: Program = toEstree(tree, { space, handlers })
    const prepand: typeof estree.body = []
    const { layout, ...rest } = data
    if (typeof layout === 'string') {
      prepand.push({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: {
              type: 'Identifier',
              name: 'OrgaLayout',
            },
          },
        ],
        source: {
          type: 'Literal',
          value: `${layout}`,
          raw: `'${layout}'`,
        },
      })
    }

    Object.entries(rest).forEach(([k, v]) => {
      const createLiteral = (text: any): Literal => {
        const value = removeQuotes(`${text}`)
        return { type: 'Literal', value, raw: `'${value}'` }
      }
      const init: Expression = Array.isArray(v)
        ? {
            type: 'ArrayExpression',
            elements: v.map(createLiteral),
          }
        : createLiteral(v)

      prepand.push({
        type: 'ExportNamedDeclaration',
        declaration: {
          type: 'VariableDeclaration',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: k },
              init,
            },
          ],
          kind: 'const',
        },
        specifiers: [],
        source: null,
      })
    })

    estree.body.unshift(...prepand)

    return estree as any
  }
}
