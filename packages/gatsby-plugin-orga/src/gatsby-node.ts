import toEstree from '@orgajs/rehype-estree'
import { walk } from 'estree-walker'
const toJsx = require('@orgajs/estree-jsx')
const reorg = require('@orgajs/reorg').default
const toRehype = require('@orgajs/reorg-rehype')
const { inspect } = require('util')
const createWebpackConfig = require('./create-webpack-config')

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

const extensions = ['.org']

export const onCreateWebpackConfig = createWebpackConfig

export const resolvableExtensions = () => extensions

export function unstable_shouldOnCreateNode({ node }) {
  return node.extension === 'org'
}

export const sourceNodes = async ({
  store, pathPrefix, actions, schema, cache, reporter,
}, pluginOptions) => {
  const { createTypes } = actions

  function processImportsExports() {

    return transform

    function transform(tree) {

      console.log(`-- processImportsExports`)
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

  async function parse (text) {

    console.log(' from parse function, i am parsing:')
    const processor = reorg()
    .use(toRehype)
    .use(toEstree)
    .use(processImportsExports)
    .use(toJsx, { renderer: '' })

    const code = await processor.process(text)
    return `${code}`
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
          const code = await parse(orgaNode.internal.content)
          return `${code}`
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
    },
    interfaces: ['Node'],
  })

  createTypes(OrgaType)
}

export const onCreateNode = async ({
  node, actions, getNode, loadNodeContent, createNodeId, createContentDigest,
}) => {

  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

  const content = await loadNodeContent(node)
  const orgaNode: any = {
    id: createNodeId(`${node.id} >>> Orga`),
    children: [],
    parent: node.id,
    internal: {
      content: content,
      type: 'Orga',
      contentDigest: createContentDigest(content),
    },
  }

  if (node.internal.type === 'File') {
    orgaNode.fileAbsolutePath = node.absolutePath
  }

  actions.createNode(orgaNode)
}

// export const preprocessSource: GatsbyNode['preprocessSource'] = async ({
//   filename, contents
// }) => {
//   const ext = path.extname(filename)
//   if (extensions.includes(ext)) {
//     const tree = await parse(contents)
//     // console.log(inspect(tree, false, null, true))
//     return tree
//   }
// }
