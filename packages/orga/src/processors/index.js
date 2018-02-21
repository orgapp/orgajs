import keyword from './keyword'
import headline from './headline'
import line from './line'
import block from './block'
import list from './list'
import table from './table'
import horizontalRule from './horizontal-rule'
import footnote from './footnote'
import blank from './blank'

module.exports = {
  keyword,
  headline,
  line,
  "block.begin": block,
  "list.item": list,
  "table.row": table,
  horizontalRule,
  footnote,
  blank,
}
