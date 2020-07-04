import Node from '../node'
const inlineParse = require('../inline').parse

function parsePlanning() {
  const token = this.next()
  if (!token || token.name !== `planning`) { return undefined }
  return new Node('planning').with(token.data)
}

function parseDrawer() {
  const begin = this.next()
  const lines = []
  while (this.hasNext()) {
    const t = this.next()
    if ( t.name === `headline` ) { return undefined }
    if (t.name === `drawer.end` ) {
      return new Node('drawer').with({ name: begin.data.type, value: lines.join(`\n`) })
    }
    lines.push(t.raw)
  }
  return undefined
}

function parseTimestamp() {
  const token = this.next()
  if (!token || token.name !== `timestamp`) { return undefined }
  return new Node('timestamp').with(token.data)
}

function process(token, section) {
  if (section.type === `footnote.definition`) return section // headline breaks footnote
  const { level, keyword, priority, tags, content } = token.data
  const currentLevel = section.level || 0
  if (level <= currentLevel) { return section }
  this.consume()
  const text = inlineParse(content)
  const headline = new Node('headline', text).with({
    level, keyword, priority, tags
  })
  var planning = this.tryTo(parsePlanning)
  while (planning) {
    headline.push(planning)
    planning = this.tryTo(parsePlanning)
  }
  const timestamp = this.tryTo(parseTimestamp)
  if (timestamp) {
    headline.push(timestamp)
  }

  while (this.hasNext() && this.peek().name === `drawer.begin`) {
    const drawer = this.tryTo(parseDrawer)
    if (!drawer) { // broken drawer
      this.downgradeToLine(this.cursor + 1)
      break
    }
    headline.push(drawer)
  }
  const newSection = new Node(`section`).with({ level })
  newSection.push(headline)
  section.push(this.parseSection(this.unagi(newSection)))
  this._aks = {}
  return this.parseSection(section)
}

module.exports = process
