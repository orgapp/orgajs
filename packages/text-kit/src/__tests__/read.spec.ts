import read from '../read'

describe('read', () => {
  it('works', () => {
    const text = `hello world
this is another line
this is the end of the file`
    const { linePosition, numberOfLines, substring, toIndex, location } = read(text)

    // console.log({ loc: location(12) })
    // console.log({ pos: linePosition(3) })
    // console.log('to index', { pos: toIndex({ line: 1, column: 0 }) })

    const debug = (position) => {
      console.log({
        position,
        raw: substring(position),
      })
    }


    debug(linePosition(3))

    // console.log({
    //   numberOfLines,
    // })
  })
})
