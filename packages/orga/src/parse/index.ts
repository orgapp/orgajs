import { Lexer } from '../tokenize'
import { Node } from 'unist'
import { Document, Parent, Token } from '../types.js'
import { isPhrasingContent } from '../utils.js'
import block from './block.js'
import latex from './latex.js'
import { Context, createContext } from './context.js'
import keyword from './keyword.js'
import list from './list.js'
import paragraph from './paragraph.js'
import section from './section.js'
import table from './table.js'
import footnote from './footnote.js'

export type Parse = (lexer: Lexer) => Parent | undefined

/*
 * break: pop handler stack, go to next handler
 * next: go to next rule in the current handler
 * finish | void: finish current handler, skip the upcoming rules
 */
type FlowControl = 'break' | 'next' | 'finish'

export type Action = (
  token: Token,
  context: Context
) => FlowControl | Handler | void

export type Predicate = string | 'EOF' | RegExp | ((token: Node) => boolean)

export function test(node: Node, predicate: Predicate) {
  return toFunc(predicate)(node)
}

export function not(test: Predicate): Predicate {
  return (token) => !toFunc(test)(token)
}

export function toFunc(test: Predicate): (token: Node) => boolean {
  if (typeof test === 'function') {
    return (token) => token && test(token)
  }
  if (test === 'EOF') {
    return (token) => {
      return token === undefined
    }
  }
  if (typeof test === 'string') {
    return (token) => token && test === token.type
  }
  return (token) => token && test.test(token.type)
}

type Rule = { test: Predicate | Predicate[]; action: Action | Handler }

export interface Handler {
  name: string
  rules: Rule[]
  eof?: (context: Context) => void
}

const main: Handler = {
  name: 'main',
  rules: [
    {
      test: 'emptyLine',
      action: (_, context) => {
        const { consume, exit } = context
        context.attributes = {}
        exit('footnote', false)
        consume()
      },
    },
    { test: 'newline', action: (_, { consume }) => consume() },
    { test: 'stars', action: section },
    { test: 'keyword', action: keyword },
    { test: 'list.item.bullet', action: list },
    { test: 'block.begin', action: block },
    { test: 'latex.begin', action: latex },
    { test: /^table\./, action: table },
    {
      test: 'hr',
      action: (token, { lexer, push }) => {
        lexer.eat()
        push(token)
      },
    },
    { test: isPhrasingContent, action: paragraph },
    { test: 'footnote.label', action: footnote },
    // catch all
    {
      test: /.*/,
      action: (_, { lexer }) => {
        lexer.eat()
      },
    },
    { test: 'EOF', action: () => 'break' },
  ],
}

export const parse = (lexer: Lexer): Document => {
  const context = createContext(lexer)

  const handlerStack: Handler[] = [main]

  const handler = () =>
    handlerStack.length > 0 ? handlerStack[handlerStack.length - 1] : undefined

  const { peek } = lexer

  let lexerLocation = lexer.save()
  let maxStaleIterations = 10

  outter: while (handler()) {
    // prevent infinit loop
    if (maxStaleIterations === 0) {
      throw new Error(`it's stuck. \n${context.state}`)
    }

    let nothingMatches = true

    for (const { test: _test, action } of handler().rules) {
      const token = peek()
      const predicates = Array.isArray(_test) ? _test : [_test]
      if (!predicates.some((p) => test(token, p))) continue
      nothingMatches = false

      if (typeof action !== 'function') {
        handlerStack.push(action)
        continue outter
      }

      const control = action(token, context)

      if (typeof control === 'object') {
        handlerStack.push(control)
        continue outter
      }

      if (control === 'break') {
        handlerStack.pop()
        // assert(stack.length > 1, `can not pop the root handler, ${printStack()}, ${stack.length}`)
        continue outter
      }
      if (control === 'next') {
        continue
      }
      break
    }

    if (nothingMatches) {
      handlerStack.pop()
      continue
    }

    if (lexer.save() === lexerLocation) {
      maxStaleIterations -= 1
    } else {
      lexerLocation = lexer.save()
      maxStaleIterations = 10
    }
  }
  if (lexer.peek()) {
    throw new Error(`not all tokens processed`)
  }

  context.exitTo('document')
  context.exit('document')

  return context.tree
}
