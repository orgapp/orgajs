import reorgParse from '@orgajs/reorg-parse'
import reorgRehype, {
  Options as ReorgRehpyeOptions,
} from '@orgajs/reorg-rehype'
import { unified, PluggableList, Processor } from 'unified'
import {
  estreeJsxBuild,
  Options as EstreeJsxBuildOptions,
} from './plugin/estree-jsx-build.js'
import {
  estreeJsxRewrite,
  Options as JSXRewriteOptions,
} from './plugin/estree-jsx-rewrite.js'
import {
  estreeStringify,
  Options as EstreeStringifyOptions,
} from './plugin/estree-stringify.js'
import {
  Options as RehypeEstreeOptions,
  rehypeEstree,
} from './plugin/rehype-estree.js'
import {
  estreeDocument,
  Options as EstreeDocumentOptions,
} from './plugin/estree-document.js'

import { development as defaultDevelopment } from './condition.js'

export interface ProcessorOptions
  extends Partial<Omit<ReorgRehpyeOptions, 'handlers'>>,
    RehypeEstreeOptions,
    EstreeDocumentOptions,
    JSXRewriteOptions,
    EstreeJsxBuildOptions,
    EstreeStringifyOptions {
  jsx: boolean
  reorgPlugins: PluggableList
  rehypePlugins: PluggableList
  estreePlugins: PluggableList
}

const defaultOptions: ProcessorOptions = {
  jsx: false,
  reorgPlugins: [],
  rehypePlugins: [],
  estreePlugins: [],
  outputFormat: 'program',

  // RehypeEstreeOptions
  space: 'html',
  parseJSX: ['jsx.value'],
  skipImport: false,
  handlers: {},

  // EstreeDocumentOptions
  baseUrl: undefined,
  useDynamicImport: false,
  pragma: 'React.createElement',
  pragmaFrag: 'React.Fragment',
  pragmaImportSource: 'react',
  jsxImportSource: 'react',
  jsxRuntime: 'automatic',
}

export function createProcessor(
  processorOptions: Partial<ProcessorOptions> = {}
): Processor {
  const {
    development,
    jsx,
    handlers,
    outputFormat,
    SourceMapGenerator,
    ...options
  } = {
    ...defaultOptions,
    ...processorOptions,
  }
  const dev =
    development === null || development === undefined
      ? defaultDevelopment
      : development

  const pipeline = unified()
    .use(reorgParse)
    .use(options.reorgPlugins)
    .use(reorgRehype, options)
    .use(options.rehypePlugins)
    .use(rehypeEstree, { ...options, handlers })
    .use(estreeDocument, { ...options, outputFormat })
    .use(options.estreePlugins)
    .use(estreeJsxRewrite, options)

  if (!jsx) {
    pipeline.use(estreeJsxBuild, { development: dev, outputFormat })
  }
  pipeline.use(estreeStringify, { SourceMapGenerator })

  return pipeline
}
