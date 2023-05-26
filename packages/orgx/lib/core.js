/**
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('unified').Processor} Processor
 * @typedef {import('./plugin/rehype-recma.js').Options} RehypeRecmaOptions
 * @typedef {import('./plugin/recma-document.js').RecmaDocumentOptions} RecmaDocumentOptions
 * @typedef {import('./plugin/recma-stringify.js').RecmaStringifyOptions} RecmaStringifyOptions
 * @typedef {import('./plugin/recma-jsx-rewrite.js').RecmaJsxRewriteOptions} RecmaJsxRewriteOptions
 */

/**
 * @typedef BaseProcessorOptions
 *   Base configuration.
 * @property {boolean | null | undefined} [jsx=false]
 *   Whether to keep JSX.
 *   Format of the files to be processed.
 * @property {'function-body' | 'program'} [outputFormat='program']
 *   Whether to compile to a whole program or a function body..
 * @property {PluggableList | null | undefined} [recmaPlugins]
 *   List of recma (esast, JavaScript) plugins.
 * @property {PluggableList | null | undefined} [reorgPlugins]
 *   List of remark (mdast, markdown) plugins.
 * @property {PluggableList | null | undefined} [rehypePlugins]
 *   List of rehype (hast, HTML) plugins.
 * @property {import('@orgajs/reorg-rehype').Options | null | undefined} [reorgRehypeOptions]
 *   Options to pass through to `reorg-rehype`.
 *
 * @typedef {Omit<RehypeRecmaOptions & RecmaDocumentOptions & RecmaStringifyOptions & RecmaJsxRewriteOptions, 'outputFormat'>} PluginOptions
 *   Configuration for internal plugins.
 *
 * @typedef {BaseProcessorOptions & PluginOptions} ProcessorOptions
 *   Configuration for processor.
 */

import { unified } from 'unified'
import reorgParse from '@orgajs/reorg-parse'
import reorgRehype from '@orgajs/reorg-rehype'
import { recmaJsxBuild } from './plugin/recma-jsx-build.js'
import { recmaDocument } from './plugin/recma-document.js'
import { recmaJsxRewrite } from './plugin/recma-jsx-rewrite.js'
import { recmaStringify } from './plugin/recma-stringify.js'
import { rehypeRecma } from './plugin/rehype-recma.js'
// import { remarkMarkAndUnravel } from './plugin/remark-mark-and-unravel.js'
import { development as defaultDevelopment } from './condition.js'

/**
 * Pipeline to:
 *
 * 1. Parse org-mode
 * 2. Transform through reorg (oast), rehype (hast), and recma (esast)
 * 3. Serialize as JavaScript
 *
 * @param {ProcessorOptions | null | undefined} [options]
 *   Configuration.
 * @return {Processor}
 *   Processor.
 */
export function createProcessor(options) {
  const {
    development,
    jsx,
    outputFormat,
    providerImportSource,
    recmaPlugins,
    rehypePlugins,
    reorgPlugins,
    reorgRehypeOptions,
    elementAttributeNameCase,
    stylePropertyNameCase,
    SourceMapGenerator,
    ...rest
  } = options || {}
  const dev =
    development === null || development === undefined
      ? defaultDevelopment
      : development

  const pipeline = unified()
    .use(reorgParse)
    .use(reorgPlugins || [])
    .use(reorgRehype, {
      ...reorgRehypeOptions,
      allowDangerousHtml: true,
    })
    .use(rehypePlugins || [])
    .use(rehypeRecma, { elementAttributeNameCase, stylePropertyNameCase })
    .use(recmaDocument, { ...rest, outputFormat })
    .use(recmaJsxRewrite, {
      development: dev,
      providerImportSource,
      outputFormat,
    })

  if (!jsx) {
    pipeline.use(recmaJsxBuild, { development: dev, outputFormat })
  }

  pipeline.use(recmaStringify, { SourceMapGenerator }).use(recmaPlugins || [])

  return pipeline
}
