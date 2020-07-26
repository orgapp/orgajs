import { map } from '../../position'
import { tokenize } from '../index'
import { inspect } from 'util'
import chalk from 'chalk'

export default (text: string): void => {
  const { substring } = map(text)
  const tokens = tokenize(text).all()
  const data = tokens.map(token => ({
    ...token,
    // _content: substring(token.position)
  }))

  const lines = [
    chalk.red('** DEBUG **'),
    chalk.red('> text:'),
    chalk.gray(text),
    chalk.red('> tokens:'),
  ].join('\n')

  console.log(lines, inspect(data, false, null, true))
  // console.log(inspect(data, false, null, true))
}
