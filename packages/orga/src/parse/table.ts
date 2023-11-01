import { Action } from './index.js'
import { isPhrasingContent } from '../utils.js'
import phrasingContent from './phrasing.js'

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

const tableRow: Action = (_, { enter, lexer }) => {
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
        action: (_, { exit, discard }) => {
          discard()
          exit('table.row')
          return 'break'
        },
      },
      { test: 'table.columnSeparator', action: (_, { consume }) => consume() },
      { test: isPhrasingContent, action: tableCell },
    ],
  }
}

const table: Action = (_, context) => {
  context.enter({
    type: 'table',
    children: [],
    attributes: {},
  })

  return {
    name: 'table',
    rules: [
      { test: 'table.columnSeparator', action: tableRow },
      { test: 'table.hr', action: (_, context) => context.consume() },
      { test: 'newline', action: (_, context) => context.discard() },
      {
        test: /.*/,
        action: (_, context) => {
          context.exitTo('table')
          context.exit('table')
          return 'break'
        },
      },
    ],
  }
}

export default table
