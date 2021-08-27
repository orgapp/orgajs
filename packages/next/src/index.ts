import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import toJsx from '@orgajs/estree-jsx'

module.exports =
  (pluginOptions: any = {}) =>
  (nextConfig: any = {}) => {
    const {
      reorgPlugins = [],
      rehypePlugins = [],
      estreePlugins = [],
      extension = /\.org$/,
      ...rest
    } = pluginOptions

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
          test: extension,
          use: [
            options.defaultLoaders.babel,
            {
              loader: require.resolve('@orgajs/loader'),
              options: {
                plugins: [
                  // ...reorgPlugins,
                  toRehype,
                  // ...rehypePlugins,
                  [toEstree, { jsx: true }],
                  // ...estreePlugins,
                  toJsx,
                ],
                ...rest,
              },
            },
          ],
        })

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    })
  }
