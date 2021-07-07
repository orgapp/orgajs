import chalk from 'chalk'
import { inspect } from 'util'
import { map } from '../../node'
import { read as locate } from 'text-kit'
import { tokenize } from '../../tokenize'
import { parse } from '../index'
import { Parent } from '../../types';

export default (text: string, useColor = true) => {
  const { substring } = locate(text)

  const colored = (color: 'red' | 'gray') => {
    if (useColor) {
      return color === 'red' ? chalk.red : chalk.gray;
    } else {
      return (text: string) => text;
    }
  }

  const red = colored('red');
  const gray = colored('gray');

  const lexer = tokenize(text)
  const tree = parse(lexer)
  const data = map(node => {
    const { parent, position, ...rest } = node as Parent
    if (!position) {
      console.log(red('no position'), inspect({ rest }, false, null, useColor))
      return {
        raw: '(unknown)',
        ...rest,
      };
    } else {
      return {
        raw: substring(position),
        ...rest,
      }
    }
  })(tree)

  const lines = [
    red('** DEBUG **'),
    red('> text:'),
    gray(text),
    red('> tree:'),
  ].join('\n')

  console.log(lines, inspect(data, false, null, useColor))
  // console.log(dump(text)(tree).join('\n'))
}
