const toRehype = require('@orgajs/reorg-rehype')
const toEstree = require('@orgajs/rehype-estree')
const toJsx = require('@orgajs/estree-jsx')

module.exports = (
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
          test: /\.js$/,
          include: cache.directory,
          use: [loaders.js()],
        },
        // {
        //   test: /\.js$/,
        //   include: path.dirname(require.resolve(`gatsby-plugin-mdx`)),
        //   use: [loaders.js()],
        // },
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
                  toJsx,
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
