import { parse } from '@typescript-eslint/typescript-estree'
// import u from 'unist-builder'
import toEstree from '../src'

const transform = (tree) => {
  return toEstree({})(tree, null)
}

describe("rehype-estree", () => {
  it ('can handle data', () => {
    // const hast = u('root', { data: { hello: 'world' } }, [])
    // const estree = transform(hast)


    // console.log(inspect(estree, false, null, true))
  })

  it ('poc', () => {
    const tree = parse(`
export const a = 'b'
export const c = 2
`)
    // console.log(inspect(tree, false, null, true))
  })
})
