import { read } from '../reader'

describe('Reader', () => {
  it.only('works', () => {
    const text = `
* TODO headline one

`
    const {
      EOF,
      eat,
      getChar,
      getLine,
      substring,
    } = read(text)

    // console.log({
    //   currentLine: currentLine(),
    // })
    // moveToNextLine()
    // console.log({
    //   currentLine: currentLine(),
    // })

    const chars: string[] = []
    while (!EOF()) {
      if (getChar() === '\n') {
        console.log('- found new line', { nl: substring(eat('char')) })
        continue
      }
      const c = getLine()
      chars.push(c)
      console.log({ char: c })
      eat('line')
    }

    console.log({ content: chars.join('') })
  })
})
