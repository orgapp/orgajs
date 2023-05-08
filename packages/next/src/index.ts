import type { ProcessorOptions as LoaderOptions } from '@orgajs/loader'
import { processImage } from './plugin/image'
import { rewriteLinks } from './plugin/link'

export interface Options extends LoaderOptions {
  extension: RegExp
}

const plugin =
  (options: Partial<Options> = {}) =>
  (nextConfig: any = {}) => {
    const { estreePlugins, ...rest } = options
    const extension = options.extension || /\.org$/

    const loader = {
      loader: require.resolve('@orgajs/loader'),
      options: {
        jsx: true,
        headingOffset: 1,
        providerimportsource: 'next-orga-import-source-file',
        estreePlugins: [processImage, rewriteLinks, ...(estreePlugins || [])],
        ...rest,
      },
    }

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.resolve.alias['next-orga-import-source-file'] = [
          'private-next-root-dir/src/orga-components',
          'private-next-root-dir/orga-components',
          '@orgajs/react',
        ]
        config.module.rules.push({
          test: extension,
          use: [options.defaultLoaders.babel, loader],
        })

        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      },
    })
  }

export default plugin
