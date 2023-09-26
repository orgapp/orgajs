import type { Node, Point, Parent } from 'unist'
import { not, test } from './index.js'
import type { Predicate } from './index.js'
import type { Lexer } from '../tokenize/index.js'
import { Attributes, Document, isSection } from '../types.js'
import { ParserOptions } from '../options.js'

interface Snapshot {
  stack: Parent[]
  savePoint: number
  level: number
  attributes: Attributes
}

export interface Context {
  // control
  // -
  enter: <N extends Parent>(node: N) => N
  exit: (predicate: Predicate, strict?: boolean) => Parent | void
  push: (node: Node) => void
  save: () => void
  restore: () => void
  addProp: (key: string, value: string) => void

  // syntactic sugar
  // -
  exitTo: (predicate: Predicate) => Parent | void
  exitAll: (predicate: Predicate) => Parent | void
  /** shorthand for lexer.eat and push it **/
  consume: () => void
  /** shorthand for lexer.eat **/
  discard: () => void
  within: (predicate: Predicate) => boolean

  // state
  attributes: Attributes
  readonly parent: Parent
  readonly level: number
  readonly tree: Document
  readonly lexer: Lexer
  readonly state: string
  readonly options: ParserOptions
}

function point(d: Point): Point {
  return { ...d }
}

export function createContext(lexer: Lexer, options: ParserOptions): Context {
  let stack: Parent[] = []
  let snapshot: Snapshot | undefined = undefined

  function enter<N extends Parent>(node: N): N {
    const start = lexer.peek()?.position?.start ||
      lexer.peek(-1)?.position?.end || { line: 1, column: 1, offset: 0 }

    // @ts-ignore will add the end later
    node.position = { start: point(start) }
    stack.push(node)
    return node
  }

  const tree = enter({
    type: 'document',
    properties: {},
    children: [],
  }) as Document

  const pop = () => {
    const node = stack.pop()

    const end = lexer.peek()?.position?.start ||
      lexer.peek(-1)?.position?.end || { line: 1, column: 1, offset: 0 }
    node.position.end = point(end)

    if (!node) {
      throw new Error('unexpected empty stack')
    }
    // attach to tree
    if (stack.length > 0) {
      push(node)
    }
    return node
  }

  function exit(predicate: Predicate, strict = true) {
    if (stack.length === 0) return // never exit the root
    const last = stack[stack.length - 1]
    if (test(last, predicate)) {
      return pop()
    }
    if (strict) {
      throw new Error(
        `
can not strictly exit ${predicate},
actual: ${last.type}
location: line: ${last.position.start.line}, column: ${last.position.start.column}
`.trim()
      )
    }
  }

  function exitTo(predicate: Predicate) {
    exitAll(not(predicate))
  }

  function exitAll(predicate: Predicate) {
    if (exit(predicate, false)) {
      exitAll(predicate)
    }
  }

  function getLevel(): number {
    let index = stack.length - 1
    while (index > 0) {
      const node = stack[index]
      if (isSection(node)) {
        return node.level
      }
      index -= 1
    }
    return 0
  }

  const push = (node: Node) => {
    if (!node) return
    if (stack.length === 0) {
      throw new Error('unexpected empty stack')
    }
    const parent = stack[stack.length - 1]
    parent.children.push(node)
    // node.parent = parent
  }

  return {
    options,
    attributes: {},
    enter,
    exit,
    exitAll,
    exitTo,
    push,
    addProp: function (key, value) {
      const k = key.toLowerCase().trim()
      const v = value.trim()
      const existing = tree.properties[k]
      if (existing) {
        Array.isArray(existing)
          ? existing.push(v)
          : (tree.properties[k] = [existing, v])
      } else {
        tree.properties[k] = v
      }
    },

    consume: function () {
      push(lexer.eat())
    },
    discard: function () {
      lexer.eat()
    },
    within: function (predicate: Predicate) {
      return test(this.parent, predicate)
    },

    save: function () {
      const level = this.level
      const attributes = this.attributes
      snapshot = {
        stack: [...stack],
        level,
        attributes: { ...attributes },
        savePoint: lexer.save(),
      }
    },

    restore: function () {
      if (snapshot === undefined) return
      this.attributes = { ...snapshot.attributes }
      stack = [...snapshot.stack]
      lexer.restore(snapshot.savePoint)
    },

    get parent() {
      return stack[stack.length - 1]
    },

    get tree() {
      return tree
    },

    get lexer() {
      return lexer
    },

    get level() {
      return getLevel()
    },

    get state() {
      const token = lexer.peek()
      const lines = [`lexer: ${lexer.save()}`]
      lines.push(`token: ${token ? token.type : 'EOF'}`)
      if (token) {
        lines.push(`content: ${lexer.substring(token.position)}`)
      }
      lines.push(`stack:   ${stack.map((n) => n.type).join(' > ')}`)
      return lines.join('\n')
    },
  }
}
