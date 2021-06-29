import chalk from 'chalk'
import { inspect } from 'util'
import { map } from '../../node'
import { read as locate } from 'text-kit'
import { tokenize } from '../../tokenize'
import { parse } from '../index'
import { Parent } from '../../types';

export default (text: string) => {
  const { substring } = locate(text)

  const lexer = tokenize(text)
  const tree = parse(lexer)
  const data = map(node => {
    const { parent, position, ...rest } = node as Parent
    if (!position) {
      console.log(chalk.red('no position'), inspect({ rest }, false, null, true))
    }
    return {
      raw: substring(position),
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
