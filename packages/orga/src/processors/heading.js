import Node from '../node'
import { parse as inlineParse } from '../inline'

function parsePlanning() {
  const token = this.next()
  if (!token || token.name != `planning`) { return undefined }
  return new Node('planning').with(token.data)
}

function parseDrawer() {
  const begin = this.next()
  var lines = []
  while (this.hasNext()) {
    const t = this.next()
    if ( t.name === `heading` ) { return undefined }
    if (t.name === `drawer.end` ) {
      return new Node('drawer').with({ name: begin.data.type, value: lines.join(`\n`) })
    }
    lines.push(t.raw)
  }
  return undefined
}

function process(token, section) {
  if (section.type === `footnote.definition`) return section // heading breaks footnote
  const { level, keyword, priority, tags, content } = token.data
  const currentLevel = section.level || 0
  if (level <= currentLevel) { return section }
  this.consume()
  const text = inlineParse(content)
  var heading = new Node('heading', text).with({
    level, keyword, priority, tags
  })
  const planning = this.tryTo(parsePlanning)
  if (planning) {
    heading.push(planning)
  }

  while (this.hasNext() && this.peek().name == `drawer.begin`) {
    let drawer = this.tryTo(parseDrawer)
    if (!drawer) { // broken drawer
      this.downgradeToLine(this.cursor + 1)
      break
    }
    heading.push(drawer)
  }
  const newSection = new Node(`section`).with({ level })
  newSection.push(heading)
  section.push(this.parseSection(this.unagi(newSection)))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
