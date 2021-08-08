import assert from 'assert'
import { Node, Point } from 'unist'
import { not, Predicate, test } from '.'
import { Lexer } from '../tokenize'
import { Attributes, Document, Parent } from '../types'

interface Snapshot {
  stack: Parent[]
  savePoint: number
  level: number
  attributes: Attributes
}

type Enter = <N extends Parent>(node: N) => N

export interface Context {
  // control
  // -
  enter: Enter
  exit: (predicate: Predicate) => Parent | void
  push: (node: Node) => void
  save: () => void
  restore: () => void

  // syntactic sugar
  // -
  exitTo: (predicate: Predicate) => Parent | void
  exitAll: (predicate: Predicate) => Parent | void
  /** shorthand for lexer.eat and push it **/
  consume: () => void
  within: (predicate: Predicate) => boolean

  // state
  attributes: Attributes
  readonly parent: Parent
  readonly level: number
  readonly tree: Document
  readonly lexer: Lexer

  state: string
}

function point(d: Point): Point {
  return { ...d }
}

export function createContext(lexer: Lexer): Context {
  let stack: Parent[] = []
  let snapshot: Snapshot | undefined = undefined

  const enter: Enter = (node) => {
    // console.log(`[enter]: ${node.type}`)
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

    assert(node, 'unexpected empty stack')
    // attach to tree
    if (stack.length > 0) {
      push(node)
    }
    return node
  }

  const exit = (predicate: Predicate) => {
    if (stack.length === 0) return // never exit the root
    const last = stack[stack.length - 1]
    if (test(last, predicate)) {
      return pop()
    }
  }

  const exitTo = (predicate: Predicate) => {
    exitAll(not(predicate))
  }

  const exitAll = (predicate: Predicate) => {
    if (exit(predicate)) {
      exitAll(predicate)
    }
  }

  const getLevel = (index = -1): number => {
    if (index === -1) {
      return getLevel(stack.length - 1)
    }

    const n = stack[index]
    if (n.type === 'document') {
      return 0
    }
    if (n && typeof n.level === 'number') {
      return n.level
    }
    return getLevel(index - 1)
  }

  const push = (node: Node) => {
    if (!node) return
    assert(stack.length > 0, 'unexpected empty stack')
    const parent = stack[stack.length - 1]
    parent.children.push(node)
    node.parent = parent
  }

  return {
    attributes: {},
    enter,
    exit,
    exitAll,
    exitTo,
    push,

    consume: function () {
      push(lexer.eat())
    },

    within: function (predicate: Predicate) {
      return test(this.parent, predicate)
    },

    save: function () {
      snapshot = {
        stack: [...stack],
        level: this.level,
        attributes: { ...this.attributes },
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
