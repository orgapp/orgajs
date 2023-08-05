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

export interface Parser {
  advance: () => Document | number
  parse: () => Document
  readonly now: number
}

export function parser(lexer: Lexer): Parser {
  const context = createContext(lexer)

  const handlerStack: Handler[] = [main]

  function handler() {
    return handlerStack.length > 0
      ? handlerStack[handlerStack.length - 1]
      : undefined
  }

  let lexerLocation = lexer.save()
  let maxStaleIterations = 10

  function advance() {
    if (!handler() && !lexer.peek()) {
      context.exitTo('document')
      context.exit('document')
      return context.tree
    }

    // prevent infinit loop
    if (maxStaleIterations === 0) {
      throw new Error(`it's stuck. \n${context.state}`)
    }

    let nothingMatches = true

    for (const { test: _test, action } of handler().rules) {
      const token = lexer.peek()
      const predicates = Array.isArray(_test) ? _test : [_test]
      if (!predicates.some((p) => test(token, p))) continue
      nothingMatches = false

      if (typeof action !== 'function') {
        handlerStack.push(action)
        return advance()
      }

      const control = action(token, context)

      if (typeof control === 'object') {
        handlerStack.push(control)
        return advance()
      }

      if (control === 'break') {
        handlerStack.pop()
        // assert(stack.length > 1, `can not pop the root handler, ${printStack()}, ${stack.length}`)
        return advance()
      }
      if (control === 'next') {
        continue
      }
      break
    }

    if (nothingMatches) {
      handlerStack.pop()
      return advance()
    }

    if (lexer.save() === lexerLocation) {
      maxStaleIterations -= 1
    } else {
      lexerLocation = lexer.save()
      maxStaleIterations = 10
    }

    if (lexer.peek()) {
      return lexer.peek().position.start.offset
    }
    return advance()
  }

  return {
    advance,
    parse() {
      for (;;) {
        const tree = advance()
        if (typeof tree === 'number') continue
        return tree
      }
    },
    get now() {
      return lexer.now
    },
  }
}
