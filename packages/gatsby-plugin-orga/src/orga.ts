import toEstree from '@orgajs/rehype-estree'
import { walk } from 'estree-walker'
import crypto from 'crypto'
import { generate } from 'astring'
import { BaseNode } from 'estree';

const toJsx = require('@orgajs/estree-jsx')
const reorg = require('@orgajs/reorg').default
const toRehype = require('@orgajs/reorg-rehype')
const { inspect } = require('util')

export async function compile ({ content, cache }) {

  const digest = crypto.createHash('sha256').update(content).digest('hex')

  const payloadCacheKey = `gatsby-plugin-orga-entrie-payload-${digest}`

  const cachedPayload = await cache.get(payloadCacheKey)
  if (cachedPayload) return cachedPayload

  const result = {
    code: undefined,
    imports: [],
    properties: undefined,
    exports: [],
  }

  const namedExports = []

  function processImportsExports() {

    return transform

    function transform(tree) {

      // console.log(inspect(tree, false, null, true))

      walk(tree, {
        enter: function (node: any) {
          if (node.type === 'ImportDeclaration') {
          }

          // replace export default with return statement
          if (node.type === 'ExportDefaultDeclaration') {
            this.replace({
              type: 'ReturnStatement',
              // @ts-ignore
              argument: node.declaration,
            })
          }

          if (node.type === 'ExportNamedDeclaration') {
            namedExports.push(node)
            console.log(`TODO: export named declaration:`, inspect(node, false, null, true))
            // TODO: save this for later
            this.remove()
          }

          if (node.type.startsWith('Import')) {
            console.log(`TODO: import:`, inspect(node, false, null, true))
            // TODO: save this for later
            this.remove()
          }
        }
      })

      return tree

    }


    // this.Compiler = compiler
  }

  const processor = reorg()
    .use(toRehype)
    .use(toEstree)
    .use(processImportsExports)
    .use(toJsx)

  const code = await processor.process(content)

  result.code = `${code}`

  const propsTree = {
    type: 'Program',
    body: [
      {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [
          {
            type: 'VariableDeclarator',
            id: {
              type: 'Identifier',
              name: 'properties',
            },
            init: {
              type: 'ObjectExpression',
              properties: namedExports.map(e => ({
                type: 'Property',
                key: e.declaration.declarations[0].id,
                value: e.declaration.declarations[0].init,
                kind: 'init',
              }))
            }
          }
        ],
      },
      {
        type: 'ReturnStatement',
        argument: {
          type: 'Identifier',
          name: 'properties',
        },
      }
    ]
  }

  result.properties = evaluate(propsTree)

  cache.set(payloadCacheKey, result)
  return result
}

function evaluate(tree: BaseNode) {
  const code = generate(tree)
  const fn = new Function('_fn', code)
  return fn({})
}
