import { Declaration, Expression } from 'estree'

export default function declarationToExpression(
  declaration: Declaration
): Expression {
  if (declaration.type === 'FunctionDeclaration') {
    return { ...declaration, type: 'FunctionExpression' }
  }

  if (declaration.type === 'ClassDeclaration') {
    return { ...declaration, type: 'ClassExpression' }
    /* c8 ignore next 4 */
  }

  // Probably `VariableDeclaration`.
  throw new Error('Cannot turn `' + declaration.type + '` into an expression')
}
