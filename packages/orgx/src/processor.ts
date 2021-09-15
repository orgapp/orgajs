import reorgParse from '@orgajs/reorg-parse'
import reorgRehype from '@orgajs/reorg-rehype'
import unified, { PluggableList } from 'unified'
import { inspect } from 'util'
import {
  estreeJsxBuild,
  Options as EstreeJsxBuildOptions,
} from './plugin/estree-jsx-build'
import {
  estreeJsxRewrite,
  Options as JSXRewriteOptions,
} from './plugin/estree-jsx-rewrite'
import { estreeStringify } from './plugin/estree-stringify'
import {
  estreeWrapInContent,
  Options as EstreeWrapInContentOptions,
} from './plugin/estree-wrap-in-content'
import {
  Options as RehypeEstreeOptions,
  rehypeEstree,
} from './plugin/rehype-estree'
import {
  Options as RehypeSetLayoutOptions,
  rehypeSetLayout,
} from './plugin/rehype-set-layout'

export interface Options
  extends RehypeEstreeOptions,
    EstreeWrapInContentOptions,
    JSXRewriteOptions,
    RehypeSetLayoutOptions,
    EstreeJsxBuildOptions {
  jsx: boolean
  reorgPlugins: PluggableList
  rehypePlugins: PluggableList
  estreePlugins: PluggableList
}

const defaultOptions: Options = {
  jsx: true,
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
  pragma: 'React.createElement',
  pragmaFrag: 'React.Fragment',
  pragmaImportSource: 'react',
  jsxImportSource: 'react',
  jsxRuntime: 'automatic' as 'automatic' | 'classic',
  passNamedExportsToLayout: true,

  // EstreeJsxRewrite
  providerImportSource: '@orgajs/react',
}

function debug() {
  this.Compiler = (stuff) => inspect(stuff, false, null, true)
}

export function createProcessor(processorOptions: Partial<Options> = {}) {
  const { jsx, ...options } = { ...defaultOptions, ...processorOptions }

  const pipeline = unified()
    .use(reorgParse)
    .use(options.reorgPlugins)
    .use(reorgRehype)
    .use(rehypeSetLayout, options)
    .use(options.rehypePlugins)
    .use(rehypeEstree, options)
    .use(options.estreePlugins)
    .use(estreeWrapInContent, options)
    .use(estreeJsxRewrite, options)

  if (!jsx) {
    pipeline.use(estreeJsxBuild, options)
  }
  pipeline.use(estreeStringify)

  return pipeline
}
