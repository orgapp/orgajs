import { CoreAPI } from '../core'
import substring from './substring'
import lines from './lines'

export default (core: CoreAPI) => {
  return substring(lines(core))
}
