import read from '../read'

describe('read', () => {
  it('works', () => {
    const text = `hello world
this is another line
this is the end of the file`
    const { linePosition, numberOfLines, substring } = read(text)


    const debug = (position) => {
      console.log({
        position,
        raw: substring(position),
      })
    }


    debug(linePosition(2))

    console.log({
      numberOfLines,
    })
  })
})
