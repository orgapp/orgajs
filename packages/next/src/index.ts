import toJsx, { Options as EstreeJsxOptions } from '@orgajs/estree-jsx'
import toEstree, { Options as RehypeEstreeOptions } from '@orgajs/rehype-estree'
import toRehype, { Options as ReorgRehypeOptions } from '@orgajs/reorg-rehype'
import { Plugin } from 'unified'
import { processImage } from './image'
import handleLink from './link'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
`

interface PluginOptions {
  extension: RegExp
  reorg: { plugins: Plugin[] }
  rehype: Partial<ReorgRehypeOptions> & { plugins: Plugin[] }
  estree: Partial<RehypeEstreeOptions> & { plugins: Plugin[] }
  jsx: Partial<EstreeJsxOptions>
}

const withDefault = (options: Partial<PluginOptions>): PluginOptions => {
  const { handlers: rehypeHandlers, ...rehypeOptions } = options.rehype || {}
  return {
    extension: options.extension || /\.org$/,
    reorg: { plugins: [], ...options.reorg },
    rehype: {
      plugins: [],
      handlers: { link: handleLink, ...rehypeHandlers },
      ...rehypeOptions,
    },
    estree: { plugins: [], injectPropsToLayout: true, ...options.estree },
    jsx: { renderer, ...options.jsx },
  }
}

const plugin =
  (options: Partial<PluginOptions> = {}) =>
  (nextConfig: any = {}) => {
    const pluginOptions = withDefault(options)

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
          test: pluginOptions.extension,
          use: [
            options.defaultLoaders.babel,
            {
              loader: require.resolve('@orgajs/loader'),
              options: {
                plugins: [
                  ...pluginOptions.reorg.plugins,
                  [toRehype, pluginOptions.rehype],
                  ...pluginOptions.rehype.plugins,
                  [toEstree, pluginOptions.estree],
                  ...pluginOptions.estree.plugins,
                  [processImage],
                  [toJsx, pluginOptions.jsx],
                ],
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

export = plugin
