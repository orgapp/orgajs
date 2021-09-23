import { generate, GENERATOR, State } from 'astring'
import * as jsxType from 'estree-jsx'

const customGenerator = {
  ...GENERATOR,
  JSXAttribute,
  JSXClosingElement,
  JSXClosingFragment,
  JSXElement,
  JSXEmptyExpression,
  JSXExpressionContainer,
  JSXFragment,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  JSXOpeningFragment,
  JSXSpreadAttribute,
  JSXText,
}

export function estreeStringify(options = {}) {
  Object.assign(this, { Compiler: compiler })

  function compiler(tree, file) {
    const result = generate(tree, {
      generator: customGenerator,
      comments: true,
    })

    return result
  }
}

/**
 * `attr`
 * `attr="something"`
 * `attr={1}`
 */
function JSXAttribute(node, state: State) {
  this[node.name.type](node.name, state)

  if (node.value !== undefined && node.value !== null) {
    state.write('=')

    // Encode double quotes in attribute values.
    if (node.value.type === 'Literal') {
      state.write(
        '"' + encodeJsx(String(node.value.value)).replace(/"/g, '&quot;') + '"'
      )
    } else {
      this[node.value.type](node.value, state)
    }
  }
}

/*
 * </div>
 */
function JSXClosingElement(node: jsxType.JSXClosingElement, state: State) {
  state.write('</')
  this[node.name.type](node.name, state)
  state.write('>')
}

/*
 * </>
 */
function JSXClosingFragment(node, state: State) {
  state.write('</>')
}

/**
 * `<div />`
 * `<div></div>`
 */
function JSXElement(node: jsxType.JSXElement, state: State) {
  let index = -1

  this[node.openingElement.type](node.openingElement, state)

  if (node.children) {
    while (++index < node.children.length) {
      const child = node.children[index]

      // Supported in types but not by Acorn.
      /* c8 ignore next 3 */
      if (child.type === 'JSXSpreadChild') {
        throw new Error('JSX spread children are not supported')
      }

      this[child.type](child, state)
    }
  }

  if (node.closingElement) {
    this[node.closingElement.type](node.closingElement, state)
  }
}

/**
 * `{}` (always in a `JSXExpressionContainer`, which does the curlies)
 */
function JSXEmptyExpression() {}

/**
 * `{expression}`
 */
function JSXExpressionContainer(
  node: jsxType.JSXExpressionContainer,
  state: State
) {
  state.write('{')
  this[node.expression.type](node.expression, state)
  state.write('}')
}

/**
 * `<></>`
 */
function JSXFragment(node: jsxType.JSXFragment, state: State) {
  let index = -1

  // @ts-ignore
  this[node.openingFragment.type](node.openingFragment, state)

  if (node.children) {
    while (++index < node.children.length) {
      const child = node.children[index]

      // Supported in types but not by Acorn.
      /* c8 ignore next 3 */
      if (child.type === 'JSXSpreadChild') {
        throw new Error('JSX spread children are not supported')
      }

      this[child.type](child, state)
    }
  }

  // @ts-ignore
  this[node.closingFragment.type](node.closingFragment, state)
}

/**
 * `div`
 */
function JSXIdentifier(node, state) {
  state.write(node.name, node)
}

/**
 * `member.expression`
 */
function JSXMemberExpression(node, state) {
  this[node.object.type](node.object, state)
  state.write('.')
  this[node.property.type](node.property, state)
}

/**
 * `ns:name`
 */
function JSXNamespacedName(node, state) {
  this[node.namespace.type](node.namespace, state)
  state.write(':')
  this[node.name.type](node.name, state)
}

/**
 * `<div>`
 */
function JSXOpeningElement(node, state) {
  let index = -1

  state.write('<')
  this[node.name.type](node.name, state)

  if (node.attributes) {
    while (++index < node.attributes.length) {
      state.write(' ')
      this[node.attributes[index].type](node.attributes[index], state)
    }
  }

  state.write(node.selfClosing ? ' />' : '>')
}

/**
 * `<>`
 */
function JSXOpeningFragment(node, state) {
  state.write('<>', node)
}

/**
 * `{...argument}`
 */
function JSXSpreadAttribute(node, state) {
  state.write('{')
  this.SpreadElement(node, state)
  state.write('}')
}

/**
 * `!`
 */
function JSXText(node, state) {
  state.write(
    encodeJsx(node.value).replace(/<|{/g, ($0) =>
      $0 === '<' ? '&lt;' : '&#123;'
    ),
    node
  )
}

function encodeJsx(value) {
  return value.replace(/&(?=[#a-z])/gi, '&amp;')
}
