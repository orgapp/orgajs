import { Reader } from 'text-kit'
import { Token } from '../../types'
import { tokenize } from '.'

const tokFootnoteRefernece = (reader: Reader) => {
  const tokens: Token[] = []

  const { eat, now, jump } = reader
  const fnb = eat(/^\[fn:/)
  if (!fnb) return
  tokens.push({
    type: 'opening',
    element: 'footnote.reference',
    position: fnb.position,
  })
  const closing = reader.findClosing(fnb.position.start)
  if (!closing) return
  const label = eat(/^[\w_-]+/)
  if (label) {
    tokens.push({
      type: 'footnote.label',
      label: label.value,
      position: label.position,
    })
  }
  if (label && now().offset === closing.offset) {
    tokens.push({
      type: 'closing',
      element: 'footnote.reference',
      position: eat().position,
    })
    return tokens
  }

  if (!eat(/^:/)) return
  const defRange = {
    start: now(),
    end: closing,
  }

  const more = tokenize(reader.read(defRange))
  tokens.push(...more)
  jump(closing)

  tokens.push({
    type: 'closing',
    element: 'footnote.reference',
    position: eat().position,
  })

  return tokens
}

export default tokFootnoteRefernece
