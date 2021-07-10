import toEstree from '@orgajs/rehype-estree'
import * as path from 'path'
import toJsx from '@orgajs/estree-jsx'
import toRehype from '@orgajs/reorg-rehype'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

export default (
  { stage, loaders, actions, plugins, cache, ...other },
  pluginOptions
) => {

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
                  [toEstree, { defaultLayout }],
                  [toJsx, { renderer }],
                ]
              }
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
                'orga-components',
              ),
              options: {
                components,
              },
            }
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
