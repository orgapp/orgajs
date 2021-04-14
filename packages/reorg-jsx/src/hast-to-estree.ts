import { parse } from '@typescript-eslint/typescript-estree'
import hast2estree from 'hast-util-to-estree'

function raw(node, context) {

  const estree = parse(node.value, { jsx: true })

  const expressions = estree.body.filter(child => {
    if (child.type === 'ImportDeclaration') {
      context.esm.push(child)
      return false
    }
    return true
  })

  return expressions
}


function toEstree (tree, options) {
  return hast2estree(tree, {
    ...options,
    handlers: {
      raw,
    }
  })
}

export default toEstree
