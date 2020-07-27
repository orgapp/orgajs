import { parse } from '../index'
import { tokenize } from '../../tokenize'
import { map, dump } from '../../node'
import { map as locate } from '../../position'
import { inspect } from 'util'
import chalk from 'chalk'

export default (text: string) => {
  const { substring } = locate(text)

  const lexer = tokenize(text)
  const tree = parse(lexer)
  const data = map(node => {
    const { parent, ...rest } = node
    return {
      raw: substring(node.position),
      ...rest,
    }
  })(tree)

  const lines = [
    chalk.red('** DEBUG **'),
    chalk.red('> text:'),
    chalk.gray(text),
    chalk.red('> tree:'),
  ].join('\n')

  console.log(lines, inspect(data, false, null, true))
  // console.log(dump(text)(tree).join('\n'))
}
