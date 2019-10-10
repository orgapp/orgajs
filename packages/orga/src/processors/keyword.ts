import Node from '../node'

function process(token, section) {
  const { key, value } = token.data
  switch (key) {
  case `TODO`:
    if (section.type !== `root`) break
    const todos = value
      .split(/\s|\|/g)
      .filter(String)
      .map((val) => /(.*?)(?:\(.*?\))?$/.exec(val)[1])
    section.meta.todos = [...new Set((section.meta.todos || []).concat(todos))]
    this.lexer.updateTODOs(section.meta.todos)
    break
  case `HTML`:
    section.push(new Node(`html`).with({ value }))
    break
  case `CAPTION`:
  case `HEADER`:
  case `NAME`:
  case `PLOT`:
  case `RESULTS`:
    this._aks[key] = value
    break
  default:
    if (section.type === `root`) {
      const field = key.toLowerCase()
        if (!section.meta[field]) {
          section.meta[field] = value;
        }
        else {
          if (!Array.isArray(section.meta[field])) {
            const list = [];
            list.push(section.meta[field])
            section.meta[field] = list
          }
          section.meta[field].push(value)
        }
    }
    break
  }
  this.consume()
  return this.parseSection(section)
}

module.exports = process
