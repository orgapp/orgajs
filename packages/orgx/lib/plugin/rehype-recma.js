/**
 * @typedef {import('estree-jsx').Program} Program
 * @typedef {import('estree-jsx').Expression} Expression
 * @typedef {import('estree-jsx').ModuleDeclaration} ModuleDeclaration
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast-util-to-estree').Handle} Handle
 * @typedef {import('hast-util-to-estree').Options} HastToEstreeOptions
 */

/**
 * @typedef {'html' | 'react'} ElementAttributeNameCase
 *   Specify casing to use for attribute names.
 *
 *   HTML casing is for example `class`, `stroke-linecap`, `xml:lang`.
 *   React casing is for example `className`, `strokeLinecap`, `xmlLang`.
 *
 * @typedef {'css' | 'dom'} StylePropertyNameCase
 *   Casing to use for property names in `style` objects.
 *
 *   CSS casing is for example `background-color` and `-webkit-line-clamp`.
 *   DOM casing is for example `backgroundColor` and `WebkitLineClamp`.
 */

/**
 * @typedef MoreOptions
 *   Configuration for internal plugin `rehype-recma`.
 * @property {ElementAttributeNameCase | undefined | null} [elementAttributeNameCase='react']
 *   Specify casing to use for attribute names.
 *
 *   This casing is used for hast elements, not for embedded Org JSX nodes
 *   (components that someone authored manually).
 * @property {StylePropertyNameCase | undefined | null} [stylePropertyNameCase='dom']
 *   Specify casing to use for property names in `style` objects.
 *
 *   This casing is used for hast elements, not for embedded Org JSX nodes
 *   (components that someone authored manually).
 * @property {boolean} [skipImport=false] - Whether to skip imports
 * @property {string[]} [parseJSX=['jsx.value']] - Specify which hast properties to parse as JSX.
 *
 * @typedef {HastToEstreeOptions & MoreOptions} Options
 */

import { toEstree } from 'hast-util-to-estree'
import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import renderError from '../util/render-error.js'

/**
 * A plugin to transform an HTML (hast) tree to a JS (estree).
 * `hast-util-to-estree` does all the work for us!
 *
 * @type {import('unified').Plugin<[Options | undefined] | [], Root, Program>}
 */
export function rehypeRecma(options = {}) {
  const {
    skipImport = false,
    parseJSX = ['jsx.value'],
    ...otherOptions
  } = options
  const handlers = options.handlers || {}

  for (const p of parseJSX) {
    const [key, ...rest] = p.split('.')
    if (!key) {
      throw new Error('somethings wrong')
    }
    const path = rest.length > 0 ? rest.join('.') : 'value'
    handlers[key] = jsxHandle(path, skipImport)
  }

  return (tree) => {
    const data = tree.data || {}
    const { layout, ...otherData } = data
    /** @type {ModuleDeclaration[]} */
    const prepand = []
    if (typeof layout === 'string') {
      prepand.push({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: {
              type: 'Identifier',
              name: 'OrgLayout',
            },
          },
        ],
        source: {
          type: 'Literal',
          value: `${layout}`,
          raw: `'${layout}'`,
        },
      })
    }
    Object.entries(otherData).forEach(([k, v]) => {
      prepand.push(createExport(k, v))
    })
    const estree = toEstree(tree, { ...otherOptions, handlers })
    estree.body.unshift(...prepand)
    return estree
  }
}

/**
 * @param {string} p
 * @param {any} o
 * @returns {any}
 */
function deepGet(p, o) {
  return p.split('.').reduce((a, v) => a[v], o)
}

const jsxParser = Parser.extend(jsx())

/**
 * @param {string} code
 */
const parse = (code) => {
  try {
    return jsxParser.parse(code, {
      sourceType: 'module',
      ecmaVersion: 2020,
    })
  } catch (err) {
    // @ts-ignore
    return renderError(err)
  }
}

/**
 * @param {import('acorn').Node | Program} node
 * @returns {node is Program}
 */
function isProgram(node) {
  return node.type === 'Program'
}

/**
 *
 * @param {string} path
 * @param {boolean} skipImport
 * @returns {Handle}
 */
function jsxHandle(path, skipImport) {
  /** @type {Handle} */
  const handle = (node, state) => {
    const estree = parse(deepGet(path, node))
    /** @type {Expression[]} */
    const expressions = []
    if (isProgram(estree)) {
      estree.body.forEach((child) => {
        if (child.type === 'ImportDeclaration') {
          if (!skipImport) {
            state.esm.push(child)
          }
          return false
        } else if (child.type === 'ExpressionStatement') {
          expressions.push(child.expression)
        } else if (
          child.type === 'ExportDefaultDeclaration' ||
          child.type === 'ExportNamedDeclaration'
        ) {
          state.esm.push(child)
        } else {
          throw new Error(`unexpected node: ${child.type}`)
        }
      })
    }

    // @ts-ignore it works
    return expressions
  }
  return handle
}

/**
 * @param {string} text
 * @returns {string}
 */
function removeQuotes(text) {
  return text.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')
}

/**
 * @param {string} k
 * @param {any} v
 * @returns {ModuleDeclaration}
 */
function createExport(k, v) {
  /** @type {(text: string) => Expression} */
  const createLiteral = (text) => {
    const value = removeQuotes(`${text}`)
    return { type: 'Literal', value, raw: `'${value}'` }
  }
  /** @type {Expression} */
  const init = Array.isArray(v)
    ? {
        type: 'ArrayExpression',
        elements: v.map(createLiteral),
      }
    : createLiteral(v)
  return {
    type: 'ExportNamedDeclaration',
    declaration: {
      type: 'VariableDeclaration',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: { type: 'Identifier', name: k },
          init,
        },
      ],
      kind: 'const',
    },
    specifiers: [],
    source: null,
  }
}
