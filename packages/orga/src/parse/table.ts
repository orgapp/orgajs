import { Action } from '.'
import { isPhrasingContent } from '../utils'
import phrasingContent from './phrasing'

const tableCell: Action = (_, { enter }) => {
  enter({
    type: 'table.cell',
    children: [],
  })

  return {
    name: 'table cell',
    rules: [
      {
        test: ['newline', 'table.columnSeparator'],
        action: (_, { exit }) => {
          exit('table.cell')
          return 'break'
        },
      },
      {
        test: isPhrasingContent,
        action: phrasingContent,
      },
      {
        test: /.*/,
        action: (_, { exit }) => {
          exit('table.cell')
          return 'break'
        },
      },
    ],
  }
}

const tableRow = (_, { enter, lexer }) => {
  enter({
    type: 'table.row',
    children: [],
  })

  // consume()
  lexer.eat()

  return {
    name: 'table row',
    rules: [
      {
        test: 'newline',
        action: (_, { exit, lexer }) => {
          lexer.eat()
          exit('table.row')
          return 'break'
        },
      },
      { test: 'table.columnSeparator', action: (_, { consume }) => consume() },
      { test: isPhrasingContent, action: tableCell },
    ],
  }
}

const table: Action = (_, { enter }) => {
  enter({
    type: 'table',
    children: [],
    attributes: {},
  })

  return {
    name: 'table',
    rules: [
      { test: 'table.columnSeparator', action: tableRow },
      { test: 'table.hr', action: (_, { consume }) => consume() },
      {
        test: /.*/,
        action: (_, { exitTo, exit }) => {
          exitTo('table')
          exit('table')
          return 'break'
        },
      },
    ],
  }
}

export default table
