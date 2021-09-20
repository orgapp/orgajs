import { Literal } from 'estree'
import { BaseNode, JSXAttribute, Program } from 'estree-jsx'
import { walk } from 'estree-walker'
import { NodePluginArgs } from 'gatsby'
import { slash } from 'gatsby-core-utils'
import path from 'path'
import { Plugin, Transformer } from 'unified'

interface Options {
  gatsby: NodePluginArgs
}

function isJSXAttribute(node: BaseNode): node is JSXAttribute {
  return node.type === 'JSXAttribute'
}

function isLiteral(node: BaseNode): node is Literal {
  return node.type === 'Literal'
}

const processLinks: Plugin = ({ gatsby }: Partial<Options>) => {
  const { getNodesByType } = gatsby

  const transformer: Transformer = async (tree: BaseNode, file) => {
    const dir = file.dirname

    const pages = getNodesByType('SitePage')

    const program = tree as Program
    walk(program, {
      enter(node) {
        if (
          isJSXAttribute(node) &&
          node.name.name === 'href' &&
          isLiteral(node.value) &&
          typeof node.value.value === 'string'
        ) {
          const filePath = slash(path.join(dir, node.value.value))
          const pageNode = pages.find((p) => p.component === filePath)
          if (!pageNode) return
          node.value.value = `${pageNode.path}`
        }
      },
    })
  }

  return transformer
}

export default processLinks
