import reorgParse from '@orgajs/reorg-parse'
import reorgRehype, {
  Options as ReorgRehpyeOptions,
} from '@orgajs/reorg-rehype'
import unified, { PluggableList } from 'unified'
import {
  estreeJsxBuild,
  Options as EstreeJsxBuildOptions,
} from './plugin/estree-jsx-build.js'
import {
  estreeJsxRewrite,
  Options as JSXRewriteOptions,
} from './plugin/estree-jsx-rewrite.js'
import { estreeStringify } from './plugin/estree-stringify.js'
import {
  estreeWrapInContent,
  Options as EstreeWrapInContentOptions,
} from './plugin/estree-wrap-in-content.js'
import {
  Options as RehypeEstreeOptions,
  rehypeEstree,
} from './plugin/rehype-estree.js'
import {
  Options as RehypeSetLayoutOptions,
  rehypeSetLayout,
} from './plugin/rehype-set-layout.js'

export interface ProcessorOptions
  extends Partial<Omit<ReorgRehpyeOptions, 'handlers'>>,
    RehypeEstreeOptions,
    EstreeWrapInContentOptions,
    JSXRewriteOptions,
    RehypeSetLayoutOptions,
    EstreeJsxBuildOptions {
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

  // EstreeWrapInContentOptions
  baseUrl: undefined,
  useDynamicImport: false,
  pragma: { name: 'createElement', source: 'react' },
  pragmaFrag: { name: 'Fragment', source: 'react' },
  jsxImportSource: 'react',
  jsxRuntime: 'automatic' as 'automatic' | 'classic',
  passNamedExportsToLayout: true,
}

export function createProcessor(
  processorOptions: Partial<ProcessorOptions> = {}
): unified.Processor<unified.Settings> {
  const { jsx, handlers, ...options } = {
    ...defaultOptions,
    ...processorOptions,
  }

  const pipeline = unified()
    .use(reorgParse)
    .use(options.reorgPlugins)
    .use(reorgRehype, options)
    .use(rehypeSetLayout, options)
    .use(options.rehypePlugins)
    .use(rehypeEstree, { ...options, handlers })
    .use(estreeWrapInContent, options)
    .use(options.estreePlugins)
    .use(estreeJsxRewrite, options)

  if (!jsx) {
    pipeline.use(estreeJsxBuild, options)
  }
  pipeline.use(estreeStringify)

  return pipeline
}
