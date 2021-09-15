import create from './create'

export default function specifiersToObjectPattern(specifiers) {
  return {
    type: 'ObjectPattern',
    properties: specifiers.map((specifier) => {
      /** @type {Identifier} */
      let key =
        specifier.type === 'ImportSpecifier'
          ? specifier.imported
          : specifier.type === 'ExportSpecifier'
          ? specifier.exported
          : { type: 'Identifier', name: 'default' }
      let value = specifier.local

      // Switch them around if we’re exporting.
      if (specifier.type === 'ExportSpecifier') {
        value = key
        key = specifier.local
      }

      return create(specifier, {
        type: 'Property',
        kind: 'init',
        shorthand: key.name === value.name,
        method: false,
        computed: false,
        key,
        value,
      })
    }),
  }
}
