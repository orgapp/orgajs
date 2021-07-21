import toEstree from '@orgajs/rehype-estree'
import { walk } from 'estree-walker'
import crypto from 'crypto'
import { generate } from 'astring'
import { BaseNode } from 'estree'
import toJsx from '@orgajs/estree-jsx'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { inspect } from 'util'
import { get } from 'lodash/fp'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

export async function compile ({ content, cache }: { content: string, cache: any }) {

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

      walk(tree, {
        enter: function (node: any) {

          /* extract named exports, pass them in to react props (pageContext) */
          if (node.type === 'ExportNamedDeclaration') {
            // if (get('node.declaration.declarations[0].init.tag')(node) === 'graphql') {
            //   return
            // }
            namedExports.push(node)
            // this.remove()
          }

          /* -- we don't render org files ourself now, it's going to webpack -- */

          // replace export default with return statement
          // if (node.type === 'ExportDefaultDeclaration') {
          //   this.replace({
          //     type: 'ReturnStatement',
          //     // @ts-ignore
          //     argument: node.declaration,
          //   })
          // }

          // if (node.type.startsWith('Import')) {
          //   console.log(`TODO: import:`, inspect(node, false, null, true))
          //   // TODO: save this for later
          //   this.remove()
          // }
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
    .use(toJsx, { renderer })

  const code = await processor.process(content)

  // console.dir('-------- code ----------')
  // console.dir(`${code}`)

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
              // TODO: handle more than 1 declarations
              properties: namedExports
                .filter(e => get('declaration.declarations[0].init.tag.name')(e) !== 'graphql')
                .map(e => ({
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
  const graphql = (query: any) => `${query}`
  const scope = {
    graphql,
  }

  const keys = Object.keys(scope)
  const values = keys.map(key => scope[key])

  const fn = new Function('_fn', ...keys, code)
  return fn({}, ...values)
}
