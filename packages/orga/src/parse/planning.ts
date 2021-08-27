import { Handler } from '.'
import { PlanningKeyword } from '../types'
import drawer from './drawer'

const planning: Handler = {
  name: 'planning',
  rules: [
    {
      test: 'planning.keyword',
      action: (keyword: PlanningKeyword, context) => {
        const { lexer, enter, push, exit } = context
        const { eat, eatAll, peek } = lexer
        const timestamp = peek(1)
        if (!timestamp || timestamp.type !== 'planning.timestamp') {
          return 'break'
        }
        enter({
          type: 'planning',
          keyword: keyword.value,
          timestamp: timestamp.value,
          children: [],
        })

        push(eat()) // keyword
        push(eat()) // timestamp
        exit('planning')

        if (eatAll('newline') > 1) {
          return 'break'
        }
      },
    },
    {
      test: 'drawer.begin',
      action: (token, context) => {
        return drawer(token, context)
      },
    },
    {
      test: /.*/,
      action: () => {
        return 'break'
      },
    },
  ],
}

export default planning
