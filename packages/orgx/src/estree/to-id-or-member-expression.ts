import {
  start as esStart,
  cont as esCont,
  name as isIdentifierName,
} from 'estree-util-is-identifier-name'
import type { Literal, Identifier } from 'estree-jsx'

export const toIdOrMemberExpression = toIdOrMemberExpressionFactory(
  'Identifier',
  'MemberExpression',
  isIdentifierName
)

export const toJsxIdOrMemberExpression = toIdOrMemberExpressionFactory(
  'JSXIdentifier',
  'JSXMemberExpression',
  isJsxIdentifierName
)

function toIdOrMemberExpressionFactory(
  idType: string,
  memberType: string,
  isIdentifier: (value: string) => boolean
) {
  return toIdOrMemberExpression
  /**
   * @param {Array<string | number>} ids
   * @returns {Identifier | MemberExpression}
   */
  function toIdOrMemberExpression(ids: (string | number)[]) {
    let index = -1
    /** @type {Identifier | Literal | MemberExpression | undefined} */
    let object

    while (++index < ids.length) {
      const name = ids[index]
      const valid = typeof name === 'string' && isIdentifier(name)

      // A value of `asd.123` could be turned into `asd['123']` in the JS form,
      // but JSX does not have a form for it, so throw.
      /* c8 ignore next 3 */
      if (idType === 'JSXIdentifier' && !valid) {
        throw new Error('Cannot turn `' + name + '` into a JSX identifier')
      }

      // @ts-expect-error: JSX is fine.
      const id: Identifier | Literal = valid
        ? { type: idType, name }
        : { type: 'Literal', value: name }
      object = object
        ? {
            type: memberType,
            object,
            property: id,
            computed: id.type === 'Literal',
            optional: false,
          }
        : id
    }

    if (!object) throw new Error('Expected non-empty `ids` to be passed')
    if (object.type === 'Literal')
      throw new Error('Expected identifier as left-most value')

    return object
  }
}

/**
 * Checks if the given string is a valid JSX identifier name.
 * @param {string} name
 */
function isJsxIdentifierName(name: string) {
  let index = -1

  while (++index < name.length) {
    // We currently receive valid input, but this catches bugs and is needed
    // when externalized.
    /* c8 ignore next */
    if (!(index ? jsxCont : esStart)(name.charCodeAt(index))) return false
  }

  // `false` if `name` is empty.
  return index > 0
}

/**
 * Checks if the given character code can continue a JSX identifier.
 * @param {number} code
 */
function jsxCont(code) {
  return code === 45 /* `-` */ || esCont(code)
}
