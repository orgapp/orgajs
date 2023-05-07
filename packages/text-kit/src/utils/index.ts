import { CoreAPI } from '../core.js'
import substring from './substring.js'
import lines from './lines.js'

export default (core: CoreAPI) => {
  return substring(lines(core))
}
