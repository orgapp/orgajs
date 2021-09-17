import { Options as LoaderOptions } from '@orgajs/loader'
import { PluginOptions } from 'gatsby'

export type Options = LoaderOptions

export const withDefault = (options: PluginOptions): Partial<Options> => {
  return {
    jsxRuntime: 'classic',
    ...options,
  }
}
