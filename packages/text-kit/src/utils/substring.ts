import { Point } from 'unist'
import { CoreAPI } from '../core.js'

export default <T extends CoreAPI>(core: T) => {
  function substring(start: Point | number, end?: Point | number) {
    const { toIndex } = core
    return core.text.substring(toIndex(start), end && toIndex(end))
  }
  return {
    ...core,
    substring,
  }
}
