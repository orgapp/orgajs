import { Paragraph } from 'orga'
import { Context } from '../'
import { all } from '../transform'

export default (context: Context) => (p: Paragraph) => {
  return context.h('p')(...all(context)(p.children))
}
