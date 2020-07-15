import { read } from '../reader'

describe('Reader', () => {
  it.only('works', () => {
    const text = `
* TODO headline one
* DONE headline two
a paragrph.
another line

  - here is something with indentation

`
    const {
      currentLine,
      nextLine,
      skipWhitespaces,
      isStartOfLine,
      EOF,
      advance,
      debug,
    } = read(text)

    // console.log({
    //   currentLine: currentLine(),
    // })
    // moveToNextLine()
    // console.log({
    //   currentLine: currentLine(),
    // })
    while (!EOF()) {
      skipWhitespaces()

      const m = advance(/\*+(?=\s)/)

      console.log({
        currentLine: currentLine(),
        isStartOfLine: isStartOfLine(),
        m,
      })
      nextLine()
    }

    console.log(debug())

    const emptyLine = '\n'


    console.log({
      line: emptyLine,
      char: emptyLine.charAt(0),
      firstShit: emptyLine.indexOf('\n', 0),
    })

  })
})
