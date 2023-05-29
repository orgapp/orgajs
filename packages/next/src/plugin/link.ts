import { BaseNode, Program } from 'estree-jsx'
import { Plugin, Transformer } from 'unified'
import { isHref, isLiteral } from './_estree-utils'

export const rewriteLinks: Plugin = () => {
  const transformer: Transformer = async (tree: BaseNode, file) => {
    const program = tree as Program
    // have to use dynamic import
    // https://github.com/Rich-Harris/estree-walker/issues/26
    const { walk } = await import('estree-walker')
    walk(program, {
      enter(node, parent) {
        if (isHref(node) && isLiteral(node.value)) {
          node.value.value = `${node.value.value}`.replace(
            /\.(org|js|ts|tsx)$/,
            ''
          )
        }
      },
    })
  }

  return transformer
}
