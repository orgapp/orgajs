import toEstree from '@orgajs/rehype-estree'
import { generate } from 'astring'
import { buildJsx } from 'estree-util-build-jsx'
import { walk } from 'estree-walker'
import { resolve } from 'dns'
import toJsx from '@orgajs/estree-jsx'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { inspect } from 'util'

export default async (
  { store, pathPrefix, actions, schema, cache, reporter },
  pluginOptions
) => {
  const { createTypes } = actions

  const { defaultLayouts } = pluginOptions

  function toFunc() {
    const compiler = (estree) => {
      // console.log(inspect(estree, false, null, true))
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

      // this.Compiler = compiler
    }

    const processor = reorg()
      .use(toRehype)
      .use(toEstree)
      .use(processImportsExports)
      .use(toFunc)
    // .use(toJsx)

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

          // if (!orgaHTMLLoader) orgaHTMLLoader = loader({ cache, reporter, store })
          // const html = await orgaHTMLLoader.load({ body: code })

          // return `${html}`
          // const webpackConfig = cloneDeep(store.getState().webpack)
          // const outputPath = path.join(cache.directory, 'webpack')
          // webpackConfig.externals = undefined
          // webpackConfig.output = {
          //   filename: `${path.basename(orgaNode.fileAbsolutePath)}.js`,
          //   path: outputPath,
          //   libraryTarget: 'commonjs',
          // }
          // webpackConfig.plugins = webpackConfig.plugins || []
          // webpackConfig.externalsPresets = {
          //   node: true,
          // }
          //
          // webpackConfig.entry = orgaNode.fileAbsolutePath
          //
          // const compiler = webpack(webpackConfig)
          //
          // console.log(inspect(webpackConfig, false, null, true))
          //
          // return new Promise((resolve) => {
          //   compiler.run((err, stats) => {
          //     if (err) {
          //       reporter.error(err.stack || err)
          //       if (has(err, 'details')) {
          //         reporter.error(`gatsby-plugin-orga\n` + get(err, 'details'))
          //       }
          //       return
          //     }
          //
          //     const info = stats.toJson()
          //     if (stats.hasErrors()) {
          //       reporter.error(`gatsby-plugin-orga\n` + info.errors)
          //     }
          //
          //     if (stats.hasWarnings()) {
          //       reporter.warn(`gatsby-plugin-orga\n` + info.warnings)
          //     }
          //
          //     console.log(inspect(info, false, null, true))
          //     resolve('info.modules')
          //
          //   })
          // })
          //
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
