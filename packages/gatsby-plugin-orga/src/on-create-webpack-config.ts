import { GatsbyNode } from 'gatsby'
import * as path from 'path'
import { withDefault } from './options'
import processLinks from './plugins/process-links'
import processImages from './plugins/process-images'

const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = (
  api,
  pluginOptions
) => {
  const { stage, loaders, actions, plugins, cache } = api
  const { components } = pluginOptions
  const { estreePlugins = [], ...rest } = withDefault(pluginOptions)

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
                jsx: true,
                providerImportSource: require.resolve('@orgajs/react'),
                estreePlugins: [
                  [processLinks, { gatsby: api }],
                  processImages,
                  ...estreePlugins,
                ],
                ...rest,
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
