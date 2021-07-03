import { read } from 'text-kit'
import { tokenize } from '../index'
import { inspect } from 'util'
import chalk from 'chalk'

export default (text: string, useColor = true): void => {
  const { substring } = read(text)

  const colored = (color: 'red' | 'gray') => {
    if (useColor) {
      return color === 'red' ? chalk.red : chalk.gray;
    } else {
      return (text: string) => text;
    }
  }

  const red = colored('red');
  const gray = colored('gray');

  const tokens = tokenize(text).all()
  const data = tokens.map(token => ({
    ...token,
    _content: substring(token.position)
  }))

  const lines = [
    red('** DEBUG **'),
    red('> text:'),
    gray(text),
    red('> tokens:'),
  ].join('\n')

  console.log(lines, inspect(data, false, null, useColor))
  // console.log(inspect(data, false, null, true))
}
