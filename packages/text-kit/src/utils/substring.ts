import { Point } from 'unist'
import { CoreAPI } from '../core'

export default <T extends CoreAPI>(core: T) => {
  const substring = (start: Point | number, end?: Point | number) => {
    const { toIndex } = core
    return core.text.substring(toIndex(start), end && toIndex(end))
  }
  return {
    ...core,
    substring,
  }
}
