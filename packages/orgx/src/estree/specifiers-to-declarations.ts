import {
  ExportSpecifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  Expression,
  VariableDeclarator,
  Identifier,
  AssignmentProperty,
} from 'estree-jsx'
import { create } from './create.js'

export function specifiersToDeclarations(
  specifiers: (
    | ImportSpecifier
    | ImportDefaultSpecifier
    | ImportNamespaceSpecifier
    | ExportSpecifier
  )[],
  init: Expression
): VariableDeclarator[] {
  let index = -1
  const declarations: VariableDeclarator[] = []
  const otherSpecifiers: (
    | ImportSpecifier
    | ImportDefaultSpecifier
    | ExportSpecifier
  )[] = []
  // Can only be one according to JS syntax.
  let importNamespaceSpecifier: ImportNamespaceSpecifier | undefined

  while (++index < specifiers.length) {
    const specifier = specifiers[index]

    if (specifier.type === 'ImportNamespaceSpecifier') {
      importNamespaceSpecifier = specifier
    } else {
      otherSpecifiers.push(specifier)
    }
  }

  if (importNamespaceSpecifier) {
    const declarator: VariableDeclarator = {
      type: 'VariableDeclarator',
      id: importNamespaceSpecifier.local,
      init,
    }
    create(importNamespaceSpecifier, declarator)
    declarations.push(declarator)
  }

  declarations.push({
    type: 'VariableDeclarator',
    id: {
      type: 'ObjectPattern',
      properties: otherSpecifiers.map((specifier) => {
        let key: Identifier =
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

        const property: AssignmentProperty = {
          type: 'Property',
          kind: 'init',
          shorthand: key.name === value.name,
          method: false,
          computed: false,
          key,
          value,
        }
        create(specifier, property)
        return property
      }),
    },
    init: importNamespaceSpecifier
      ? { type: 'Identifier', name: importNamespaceSpecifier.local.name }
      : init,
  })

  return declarations
}
