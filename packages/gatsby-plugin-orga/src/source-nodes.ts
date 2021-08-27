import toEstree from '@orgajs/rehype-estree'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { generate } from 'astring'
import { buildJsx } from 'estree-util-build-jsx'
import { walk } from 'estree-walker'
import { inspect } from 'util'

export default async (
  { store, pathPrefix, actions, schema, cache, reporter },
  pluginOptions
) => {
  const { createTypes } = actions

  const { defaultLayouts } = pluginOptions

  function toFunc() {
    const compiler = (estree) => {
      const tree = buildJsx(estree, {
        pragma: 'orga',
        pragmaFrag: 'orga.Fragment',
      })
      return generate(tree)
    }
    this.Compiler = compiler
  }

  async function compile(node) {
    const payloadCacheKey = `gatsby-plugin-orga-entrie-payload-${
      node.internal.contentDigest
    }-${pathPrefix || ''}`

    const cachedPayload = await cache.get(payloadCacheKey)
    if (cachedPayload) return cachedPayload

    const result = {
      body: undefined,
      imports: [],
      layout: defaultLayouts.default,
    }

    function processImportsExports() {
      return transform

      function transform(tree) {
        walk(tree, {
          enter: function (node) {
            // replace export default with return statement
            if (node.type === 'ExportDefaultDeclaration') {
              this.replace({
                type: 'ReturnStatement',
                // @ts-ignore
                argument: node.declaration,
              })
            }

            if (node.type === 'ExportNamedDeclaration') {
              console.log(
                `TODO: export named declaration:`,
                inspect(node, false, null, true)
              )
              // TODO: save this for later
              this.remove()
            }

            if (node.type.startsWith('Import')) {
              console.log(`TODO: import:`, inspect(node, false, null, true))
              // TODO: save this for later
              this.remove()
            }
          },
        })

        return tree
      }
    }

    const processor = reorg()
      .use(toRehype)
      .use(toEstree)
      .use(processImportsExports)
      .use(toFunc)

    const code = await processor.process(node.internal.content)

    result.body = `${code}`

    return result
  }

  const OrgaType = schema.buildObjectType({
    name: 'Orga',
    fields: {
      // raw: { type: 'String!' },
      fileAbsolutePath: { type: 'String!' },
      body: {
        type: 'String!',
        async resolve(orgaNode) {
          reporter.log('getting html')
          const { body } = await compile(orgaNode)
          return body
        },
      },
      layout: {
        type: 'String!',
        async resolve(orgaNode) {
          const { layout } = await compile(orgaNode)
          return layout
        },
      },
    },
    interfaces: ['Node'],
  })

  createTypes(OrgaType)
}
