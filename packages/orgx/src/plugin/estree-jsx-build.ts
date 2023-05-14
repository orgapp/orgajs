import { buildJsx } from 'estree-util-build-jsx'
import type { Program } from 'estree'
import type { Plugin } from 'unified'
import { specifiersToDeclarations } from '../estree/specifiers-to-declarations.js'
import { toIdOrMemberExpression } from '../estree/to-id-or-member-expression.js'

export interface Options {
  outputFormat?: 'program' | 'function-body'
  development?: boolean
}

export const estreeJsxBuild: Plugin = (options: Options) => {
  const { development, outputFormat } = options

  return (tree: Program, file) => {
    buildJsx(tree, { development, filePath: file.history[0] })

    // When compiling to a function body, replace the import that was just
    // generated, and get `jsx`, `jsxs`, and `Fragment` from `arguments[0]`
    // instead.
    if (
      outputFormat === 'function-body' &&
      tree.body[0] &&
      tree.body[0].type === 'ImportDeclaration' &&
      typeof tree.body[0].source.value === 'string' &&
      /\/jsx-(dev-)?runtime$/.test(tree.body[0].source.value)
    ) {
      tree.body[0] = {
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: specifiersToDeclarations(
          tree.body[0].specifiers,
          toIdOrMemberExpression(['arguments', 0])
        ),
      }
    }
  }
}
