import { BaseExpression } from 'estree'
import { Node as HastNode } from 'hast'

export type Handler = (node: HastNode, context: any) => BaseExpression

export interface Options {
  space: 'html' | 'svg'
  jsx: boolean
  parseJSX: string[]
  defaultLayout?: string
  handlers: { [key: string]: Handler }
  skipExport: boolean
  skipImport: boolean
  wrapExport?: string
  injectPropsToLayout: boolean
}

export const DEFAULT_OPTIONS: Options = {
  space: 'html',
  jsx: true,
  parseJSX: ['jsx.value'],
  handlers: {},
  skipExport: false,
  skipImport: false,
  injectPropsToLayout: false,
}
