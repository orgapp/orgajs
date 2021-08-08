import chalk from 'chalk'
import { inspect } from 'util'
import { map } from '../../node'
import { read as locate } from 'text-kit'
import { tokenize } from '../../tokenize'
import { parse as _parse } from '../index'

export const debug = (text: string) => {
  const { substring } = locate(text)

  const tree = parse(text)

  const data = map((node) => {
    const { parent, position, ...rest } = node
    if (!position) {
      console.log(
        chalk.red('no position'),
        inspect({ rest }, false, null, true)
      )
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

export const parse = (text: string) => {
  const lexer = tokenize(text, { timezone: 'Pacific/Auckland' })
  // console.log({ tokens: lexer.all() })
  return _parse(lexer)
}
