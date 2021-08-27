import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import { GatsbyNode } from 'gatsby'
import { HNode, Context, Handler } from 'oast-to-hast'
import { Block } from 'orga'
import * as path from 'path'
import processImages from './plugins/process-images'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`
const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = (
  api,
  pluginOptions
) => {
  const { stage, loaders, actions, plugins, cache } = api
  const { defaultLayout, components } = pluginOptions

  const handleBlock: Handler = (node: Block, context) => {
    const { h, u, defaultHandler } = context
    const name = node.name.toLowerCase()

    if (name === 'src') {
      const body: HNode = u('text', node.value)
      const lang = node.params[0]
      return h('CodeBlock', { className: [`language-${lang}`] })(body)
    }
    return defaultHandler(node.type)
  }

  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.js$/,
          include: cache.directory,
          use: [loaders.js()],
        },
        {
          test: /\.org$/,
          use: [
            loaders.js(),
            {
              loader: '@orgajs/loader',
              options: {
                plugins: [
                  [toRehype, { handlers: { block: handleBlock } }],
                  [processImages, { gatsby: api }],
                  [toEstree, { defaultLayout }],
                  [toJsx, { renderer }],
                ],
              },
            },
          ],
        },
        {
          test: /orga-components\.js$/,
          include: path.dirname(require.resolve('gatsby-plugin-orga')),
          use: [
            loaders.js(),
            {
              loader: path.join(
                'gatsby-plugin-orga',
                'loaders',
                'orga-components'
              ),
              options: {
                components: {
                  CodeBlock: require.resolve(
                    path.join(
                      'gatsby-plugin-orga',
                      'components',
                      'code-block.tsx'
                    )
                  ),
                  ...(components as Record<string, unknown>),
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`,
      }),
    ],
  })
}
export default onCreateWebpackConfig
