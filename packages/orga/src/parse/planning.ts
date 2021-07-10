import { Lexer } from '../tokenize'
import { Planning } from '../types'
import * as ast from './utils';

export default (lexer: Lexer): Planning[] => {

  const { eat } = lexer

  const all: Planning[] = []

  const parse = (): void => {
    const keyword = eat('planning.keyword')
    const timestamp = eat('planning.timestamp')
    if (!keyword) return
    if (!timestamp) return
    const planning = ast.planning(keyword.value, timestamp.value, {
      position: {
        start: keyword.position.start,
        end: timestamp.position.end,
      },
    });

    all.push(planning)
    parse()
  }

  parse()
  eat('newline');
  return all
}
