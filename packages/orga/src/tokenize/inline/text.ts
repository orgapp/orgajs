import { Reader } from 'text-kit'
import { Point } from 'unist'
import { Tokenizer } from '..'
import { Style, Token } from '../../types'
import uri from '../../uri'

const MARKERS: { [key: string]: Style } = {
  '*': 'bold',
  '=': 'verbatim',
  '/': 'italic',
  '+': 'strikeThrough',
  _: 'underline',
  '~': 'code',
}

const tokenizeText =
  (bol: Point | undefined = undefined) =>
  (reader: Reader) => {
    const tokens: Token[] = []
    const { now, eat, jump, getChar, findClosing, substring } = reader
    const marker = getChar()
    const style = MARKERS[marker]
    if (!style) return
    // check pre
    const pre = getChar(-1)
    const isBOL = (bol && bol.offset === now().offset) || now().column === 1
    if (!isBOL && !/[\s({'"]/.test(pre)) return
    const tokenStart = now()

    const closing = findClosing(now())
    if (!closing) return

    eat()
    const valueStart = now()
    // check border
    if (getChar().match(/\s/)) return

    jump(closing)
    // check border
    if (getChar(-1).match(/\s/)) return
    // check post
    const post = getChar(1)
    if (post && ` \t\n-.,;:!?')}["`.indexOf(post) === -1) return

    const valueEnd = now()
    eat() // closing
    tokens.push({
      type: 'text',
      style,
      value: substring(valueStart, valueEnd),
      position: { start: tokenStart, end: now() },
    })
    return tokens
  }

export default tokenizeText
