import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import { GatsbyNode } from 'gatsby'
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
                  toRehype,
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
                components,
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
