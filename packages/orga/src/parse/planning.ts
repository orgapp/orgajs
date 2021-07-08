import { Lexer } from '../tokenize'
import { Planning } from '../types'
import * as ast from './utils';

export default (lexer: Lexer): Planning[] => {

  const { peek, eat } = lexer

  const all: Planning[] = []

  const parse = (): void => {
    const keyword = peek()
    const timestamp = peek(1)
    if (!keyword || keyword.type !== 'planning.keyword') return
    if (!timestamp || timestamp.type !== 'planning.timestamp') return
    const planning = ast.planning(keyword.value, timestamp.value, {
      position: {
        start: keyword.position.start,
        end: timestamp.position.end,
      },
    });
    eat()
    eat()

    all.push(planning)
    parse()
  }

  parse()
  const nl = peek()
  if (nl && nl.type === 'newline') eat()
  return all
}
