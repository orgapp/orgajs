import { GatsbyNode, NodeInput } from 'gatsby'
import path from 'path'
import { inspect } from 'util'
import createWebpackConfig from './create-webpack-config'
import { cloneDeep, has, get } from 'lodash'
import webpack from 'webpack'
import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import { walk } from 'estree-walker'

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


export const sourceNodes: GatsbyNode['sourceNodes'] = async ({
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
            console.log(`-- found import:`)
            console.log(inspect(node, false, null, true))
            // @ts-ignore
            node.source.value = 'hello'
            // @ts-ignore
            node.source.raw = 'box'
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
    .use(toJsx, { renderer: '', pragma: '' })

    const code = await processor.process(text)
    return `${code}`
  }

  const OrgaType = schema.buildObjectType({
    name: 'Orga',
    fields: {
      // raw: { type: 'String!' },
      fileAbsolutePath: { type: 'String!' },
      html: {
        type: 'String!',
        async resolve(orgaNode) {

          console.log('this is from console.log')

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

export const onCreateNode: GatsbyNode['onCreateNode'] = async ({
  node, actions, getNode, loadNodeContent, createNodeId, createContentDigest,
}) => {

  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

  const content = await loadNodeContent(node)
  const orgaNode: NodeInput = {
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
