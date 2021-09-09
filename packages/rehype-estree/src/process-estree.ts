import { ExportNamedDeclaration } from 'estree'
import { walk } from 'estree-walker'
import { analyze } from 'periscopic'
import { Options } from './options'
import {
  builders as b,
  checkers as check,
  createContent,
  createMakeShortcodeHelper,
  layoutBuilder,
} from './trees'

function processEstree(estree, options: Options) {
  const { skipExport, wrapExport, defaultLayout, injectPropsToLayout } = options

  let children = []
  const lb = layoutBuilder()

  if (defaultLayout) {
    lb.setDefaultLayout(defaultLayout)
  }

  // Find the `export default`, the JSX expression, and leave the rest
  // (import/exports) as they are.
  estree.body = estree.body.filter((child) => {
    if (check.isExpressionStatement(child)) {
      children =
        child.expression.type === 'JSXFragment'
          ? child.expression.children
          : [child.expression]
      return false
    }

    return true
  })

  // Find everything that’s defined in the top-level scope.
  // Do this here because `estree` currently only includes import/exports
  // and we don’t have to walk all the JSX to figure out the top scope.
  let inTopScope = [
    'OrgaLayout',
    'OrgaContent',
    ...analyze(estree).scope.declarations.keys(),
  ]

  const { layout, nodes } = createContent(children)

  estree.body = [...estree.body, ...nodes]

  const components = []
  // Add `orgaType`, `parentName` props to JSX elements.
  const magicShortcodes = []
  const stack = []
  const declarations: ExportNamedDeclaration[] = []

  walk(estree, {
    enter: function (node) {
      // ```js
      // export default a = 1, this is the layout
      // ```
      if (check.isExportDefaultDeclaration(node)) {
        lb.declareLayout(node.declaration)
        this.remove()
        return
      }

      // ```js
      // export {default} from "a"
      // export {default as a} from "b"
      // export {default as a, b} from "c"
      // export {a as default} from "b"
      // export {a as default, b} from "c"
      // ```
      if (check.isExportNamedDeclaration(node) && !!node.source) {
        node.specifiers = node.specifiers.filter((specifier) => {
          if (specifier.exported.name === 'default') {
            lb.setDefaultLayout({ local: specifier.local, source: node.source })
            return false
          }

          return true
        })

        // Keep the export if there are other specifiers, drop it if there was
        // just a default.
        if (node.specifiers.length === 0) {
          this.remove()
          return
        }
      }

      if (check.isExportNamedDeclaration(node)) {
        declarations.push(node)
        this.remove()
        return
      }

      if (check.isDeclaration(node)) {
        const names = analyze(node).scope.declarations.keys()
        const clean = [...names].filter((n) => n !== 'OrgaContent')
        if (clean.length > 0) {
          inTopScope = [...inTopScope, ...clean]
          components.push(node)
          this.remove()
          return
        }
      }

      if (check.isJSXElement(node)) {
        const name = node.openingElement.name.name

        if (stack.length > 1) {
          const parentName = stack[stack.length - 1]
          node.openingElement.attributes.push(
            b.jsxAttribute('parentName', parentName)
          )
        }

        const head = name.charAt(0)

        // A component.
        if (head === head.toUpperCase() && name !== 'OrgaLayout') {
          node.openingElement.attributes.push(b.jsxAttribute('orgaType', name))
          if (!inTopScope.includes(name) && !magicShortcodes.includes(name)) {
            magicShortcodes.push(name)
          }
        }

        stack.push(name)
      }
    },
    leave: function (node) {
      // unwrap JSXElement
      if (check.isExpressionStatement(node)) {
        this.replace(node.expression)
      }

      if (check.isJSXElement(node)) {
        stack.pop()
      }
    },
  })

  if (injectPropsToLayout) {
    for (const d of declarations) {
      if (!check.isVariableDeclaration(d.declaration)) continue
      for (const _d of d.declaration.declarations) {
        if (check.isIdentifier(_d.id)) {
          layout.injectProp(_d.id.name)
        }
      }
    }
  }

  const exports = []

  if (!skipExport) {
    let declaration: any = { type: 'Identifier', name: 'OrgaContent' }

    if (wrapExport) {
      declaration = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: wrapExport },
        arguments: [declaration],
      }
    }

    exports.push({
      type: 'ExportDefaultDeclaration',
      declaration: declaration,
    })
  }

  estree.body = [
    ...createMakeShortcodeHelper(magicShortcodes, true),
    ...declarations,
    ...lb.getLayout(),
    ...components,
    ...estree.body,
    ...exports,
  ]

  return estree
}

export default processEstree
