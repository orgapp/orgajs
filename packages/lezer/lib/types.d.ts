import { Document, Content, Parent as OastParent } from 'orga'
import { Tree as LezerTree } from '@lezer/common'
import { Position } from 'unist'

export type OastNode = Document | Content

type Action = boolean

export type Seed =
  | {
      id: number
      position?: Position
      props?: any
      skip?: Action
    }
  | Action
  | number

interface LezerChild {
  node: LezerTree
  position: number
}

export type Handler = (
  state: State,
  node: OastNode,
  parent: OastNode | undefined
) => Seed

export interface State {
  ignore: string[]
  handlers: Record<string, Handler>
  one: (
    node: OastNode,
    parent?: OastParent | undefined = undefined,
    base?: number = 0
  ) => { nodes: LezerTree[]; positions: number[] } | null | undefined
  all: (
    node: OastNode,
    base: number
  ) => { nodes: LezerTree[]; positions: number[] }
}
