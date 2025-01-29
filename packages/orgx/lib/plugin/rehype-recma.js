/**
 * @import {Root} from 'hast'
 * @import {Program, Expression, ModuleDeclaration} from 'estree'
 * @typedef {import('rehype-recma').Options} Options
 */

import { toEstree } from 'hast-util-to-estree'
import { Parser } from 'acorn'
import jsx from 'acorn-jsx'
import renderError from '../util/render-error.js'

/**
 * Plugin to transform HTML (hast) to JS (estree).
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehypeRecma(options) {
  /**
   * @param {Root} tree
   *   Tree (hast).
   * @returns {Program}
   *   Program (esast).
   */
  return function (tree) {
    const data = tree.data || {}
    /** @type {ModuleDeclaration[]} */
    const prepand = []
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'layout') {
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
            value: `${v}`,
            raw: `'${v}'`,
          },
        })
      } else {
        prepand.push(createExport(k, v))
      }
    })

    const estree = toEstree(tree, { ...options, handlers: { jsx: handleJsx } })
    estree.body.unshift(...prepand)
    return estree
  }
}

const jsxParser = Parser.extend(jsx())

/**
 * @param {import('acorn').Node | Program} node
 * @returns {node is Program}
 */
function isProgram(node) {
  return node.type === 'Program'
}

/**
 * @param {string} code
 */
function parse(code) {
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

/** @type {import("hast-util-to-estree").Handle} */
export const handleJsx = (node, state) => {
  let skipImport = false
  const estree = parse(node.value)

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

  // @ts-expect-error: array works
  // https://github.com/syntax-tree/hast-util-to-estree/blob/c0c4bd33583abade25c4f4e248a06cb1ec8c3aff/lib/state.js#L215
  return expressions
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
