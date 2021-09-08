import { SimpleLiteral } from 'estree'
import { JSXAttribute } from 'estree-jsx'

const literal = (value: string): SimpleLiteral => ({
  type: 'Literal',
  value,
  raw: JSON.stringify(value),
})

const jsxAttribute = (name: string, value: string): JSXAttribute => ({
  type: 'JSXAttribute',
  name: { type: 'JSXIdentifier', name },
  value: literal(value),
})

export default {
  literal,
  jsxAttribute,
}
