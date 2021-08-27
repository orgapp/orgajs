import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { generate } from 'astring'
import crypto from 'crypto'
import { BaseNode } from 'estree'
import { walk } from 'estree-walker'
import { get } from 'lodash/fp'
import { GatsbyCache } from 'gatsby'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

export async function compile({
  content,
  cache,
}: {
  content: string
  cache: GatsbyCache
}): Promise<{
  code: string
  properties: Record<string, unknown>
  imports: string[]
  exports: string[]
}> {
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
            namedExports.push(node)
          }

          /* -- we don't render org files ourself now, it's going to webpack -- */
        },
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
                .filter(
                  (e) =>
                    get('declaration.declarations[0].init.tag.name')(e) !==
                    'graphql'
                )
                .map((e) => ({
                  type: 'Property',
                  key: e.declaration.declarations[0].id,
                  value: e.declaration.declarations[0].init,
                  kind: 'init',
                })),
            },
          },
        ],
      },
      {
        type: 'ReturnStatement',
        argument: {
          type: 'Identifier',
          name: 'properties',
        },
      },
    ],
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
  const values = keys.map((key) => scope[key])

  const fn = new Function('_fn', ...keys, code)
  return fn({}, ...values)
}
