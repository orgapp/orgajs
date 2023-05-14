import { Expression } from 'estree-jsx'

export function toBinaryAddition(expressions: Expression[]) {
  let index = -1
  let left: Expression | undefined

  while (++index < expressions.length) {
    const right = expressions[index]
    left = left
      ? { type: 'BinaryExpression', left, operator: '+', right }
      : right
  }

  if (!left) throw new Error('Expected non-empty `expressions` to be passed')

  return left
}
