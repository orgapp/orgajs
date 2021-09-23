import type { ProcessorOptions as LoaderOptions } from '@orgajs/loader'
import { processImage } from './plugin/image'
import { rewriteLinks } from './plugin/link'

export interface Options extends LoaderOptions {
  extension: RegExp
}

const plugin =
  (options: Partial<Options> = {}) =>
  (nextConfig: any = {}) => {
    const { extension = /\.org$/, estreePlugins, ...rest } = options

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
          test: extension,
          use: [
            options.defaultLoaders.babel,
            {
              loader: require.resolve('@orgajs/loader'),
              options: {
                jsx: true,
                providerImportSource: require.resolve('@orgajs/react'),
                estreePlugins: [
                  processImage,
                  rewriteLinks,
                  ...(estreePlugins || []),
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

export default plugin
