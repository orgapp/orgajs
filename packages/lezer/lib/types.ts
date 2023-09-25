import { Document, Content, Parent as OastParent, Token } from 'orga'
import { Tree as LezerTree } from '@lezer/common'
import { Position } from 'unist'
import { type VFile } from 'vfile'

export type OastNode = Document | Content | Token

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
  parent: OastParent | undefined
) => Seed

export interface State {
  file: VFile | null
  ignore: string[]
  handlers: Record<string, Handler>
  one: (
    node: OastNode,
    parent?: OastParent | undefined,
    base?: number
  ) => { nodes: LezerTree[]; positions: number[] } | null | undefined
  all: (
    node: OastNode,
    base: number
  ) => { nodes: LezerTree[]; positions: number[] }
}
