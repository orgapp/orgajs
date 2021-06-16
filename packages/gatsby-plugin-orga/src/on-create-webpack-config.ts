import toEstree from '@orgajs/rehype-estree'
const toJsx = require('@orgajs/estree-jsx')
const toRehype = require('@orgajs/reorg-rehype')

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

export default (
  { stage, loaders, actions, plugins, cache, ...other },
  pluginOptions
) => {

  const { defaultLayout } = pluginOptions

  actions.setWebpackConfig({
    module: {
      rules: [
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
      ],
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`,
      }),
    ],
  })
}
