import { Properties } from 'hast'
import u from 'unist-builder'
import { Context } from '../'
import { HNode } from '../transform'

export default (context: Context) => {
  return {
    h: (tagName: string, properties: Properties | undefined = undefined) => (...children: HNode[]): HNode => {
      return context.build({
        tagName,
        properties,
        children,
      })
    },
    u,
  }
}
