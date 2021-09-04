import toJsx, { Options as EstreeJsxOptions } from '@orgajs/estree-jsx'
import toEstree, { Options as RehypeEstreeOptions } from '@orgajs/rehype-estree'
import toRehype, { Options as ReorgRehypeOptions } from '@orgajs/reorg-rehype'
import { Handler } from 'oast-to-hast'
import { Link } from 'orga'
import { processImage } from './image'

const renderer = `import React from 'react'
import {orga} from '@orgajs/react'
import { graphql } from 'gatsby'
`

interface PluginOptions {
  extension: RegExp
  options: {
    reorg_rehype: ReorgRehypeOptions
    rehype_estree: RehypeEstreeOptions
    estree_jsx: EstreeJsxOptions
  }
}

const link: Handler = (node: Link, context) => {
  const { h, all, defaultHandler } = context
  if (node.path.protocol === 'file' && node.path.value.endsWith('.org')) {
    return h('Link', {
      href: node.path.value.replace(/\.org$/, ''),
    })(...all(node.children, context))
  }
  return defaultHandler(node.type)
}

module.exports =
  (pluginOptions: Partial<PluginOptions> = {}) =>
  (nextConfig: any = {}) => {
    const {
      reorg_rehype = { handlers: { link } },
      rehype_estree = { jsx: true },
      estree_jsx = {},
    } = pluginOptions.options || {}

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        config.module.rules.push({
          test: pluginOptions.extension || /\.org$/,
          use: [
            options.defaultLoaders.babel,
            {
              loader: require.resolve('@orgajs/loader'),
              options: {
                plugins: [
                  [toRehype, reorg_rehype],
                  [toEstree, rehype_estree],
                  [processImage],
                  [toJsx, estree_jsx],
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
