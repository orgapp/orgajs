import { newNode, push } from '../node'
import { Parent } from '../types'
import { Parse } from './'

const parseParagraph: Parse = ({ peek, match, eat }) => {
  let eolCount = 0

  if (!match(/^text\./)) return undefined

  const build = (p: Parent): Parent | undefined => {
    const token = peek()
    if (!token || eolCount >= 2) {
      if (p.children.length === 0) return undefined
      return p
    }
    if (token.type === 'newline') {
      eat()
      eolCount += 1
      return build(p)
    }

    if (token.type.startsWith('text.')) {
      push(p)(token)
      eat()
      return build(p)
    }
    return p
  }

  return build(newNode('paragraph'))

}

export default parseParagraph
