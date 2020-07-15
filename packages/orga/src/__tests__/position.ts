import { map } from '../position'

describe('Position', () => {
  it.only('works', () => {

    const text = `
* h
b
`
    console.log(text.length)

    const { location, debug } = map(text)

    debug()
    console.log({ location: location(text.length) })
  })
})
