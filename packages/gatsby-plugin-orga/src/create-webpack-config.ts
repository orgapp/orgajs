import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

export default (
  { stage, loaders, actions, plugins, cache, ...other },
  pluginOptions
) => {
  // const options = defaultOptions(pluginOptions)
  // const {
  //   reorgPlugins: [],
  //   rehypePlugins: [],
  //   estreePlugins: [],
  // } = pluginOptions || {}

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
                  toEstree,
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
