const TO_DISCARD = [
  'caption',
  'header',
  'name',
  'plot',
  'results',
  /^attr_\w+/i, // Affiliated Keywords
  /^begin_\w+/i,
  /^end_\w+/i,
  'begin',
  'end', // blocks
  'call', // call
]

const shouldDiscard = (key: string) => {
  return !!TO_DISCARD.find((test) => {
    if (typeof test === 'string') {
      return test === key.toLowerCase()
    }
    return test.test(key)
  })
}

/*
 * trim whitespaces and strip quotes if necessary
 */
const processValue = (text: string): Value => {
  return text.trim().replace(/^["'](.+(?=["']$))["']$/, '$1')
}

// TODO: more types?
type Value = string

type Metadata = Record<string, Value | Value[]>

const pushTo = (data: Metadata) => (_key: string, _value: string) => {
  const key = _key.toLowerCase()
  const value = processValue(_value)

  const existing = data[key]
  if (existing) {
    Array.isArray(existing)
      ? existing.push(value)
      : (data[key] = [existing, value])
  } else {
    data[key] = value
  }
  return data
}

const parse = (text: string) => {
  const matches = text.matchAll(/^\s*#\+(\S+):(.*)$/gm)
  return [...matches].reduce((data, [, key, value]) => {
    if (shouldDiscard(key)) return data
    return pushTo(data)(key, value)
  }, {} as Metadata)
}

export default parse
