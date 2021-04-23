import u from 'unist-builder'
import { parse } from '@typescript-eslint/typescript-estree'
import toEstree from '../src'
import { inspect } from 'util'
import { ExpressionStatement } from 'estree'

const transform = (tree) => {
  return toEstree({})(tree, null)
}

describe("rehype-estree", () => {
  it ('can handle data', () => {
    const hast = u('root', { data: { hello: 'world' } }, [])
    const estree = transform(hast)


    console.log(inspect(estree, false, null, true))
  })

  it.only ('poc', () => {
    const tree = parse(`
export const a = 'b'
export const c = 2
`)
    console.log(inspect(tree, false, null, true))
  })
})
