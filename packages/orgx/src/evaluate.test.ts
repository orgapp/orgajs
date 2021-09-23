import { evaluate } from './evaluate'
import * as runtime from 'react/jsx-runtime'

describe('evaluate file', () => {
  it('can evaluate org file', async () => {
    const text = `
#+title: hello
* hello
`
    // @ts-ignore
    const result = await evaluate(text, runtime)
    console.log({ result: result.default })
  })
})
