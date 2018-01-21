function Syntax() {
  this.rules = []
}

Syntax.prototype = {
  define: function(name, pattern, post = () => { return {} }) {
    this.rules.push({
      name,
      pattern,
      post,
    })
  },

  update: function(name, pattern) {
    const i = this.rules.findIndex(r => r.name == name)
    var newRule = { name, post: () => {} }
    if (i != -1) {
      newRule = this.rules.splice(i, 1)[0]
    }
    newRule.pattern = pattern
    this.rules.splice(i, 0, newRule)
  }
}

var org = new Syntax()

function headlinePattern(todos = ['TODO', 'DONE']) {
  return RegExp(`^(\\*+)\\s+(?:(${todos.join('|')})\\s+)?(?:\\[#(A|B|C)\\]\\s+)?(.*?)\\s*(:(?:\\w+:)+)?$`)
}

org.define('headline', headlinePattern(), m => {
  const level = m[1].length
  const keyword = m[2]
  const priority = m[3]
  const content = m[4]
  const tags = (m[5] || '').split(':').map( str => str.trim()).filter(String)
  return { level, keyword, priority, content, tags }
})

org.define('keyword', /^\s*#\+(\w+):\s*(.*)$/, m => {
  const key = m[1]
  const value = m[2]
  return { key, value }
})

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']
org.define('planning', RegExp(`^\\s*(${PLANNING_KEYWORDS.join('|')}):\\s*(.+)$`), m => {
  const keyword = m[1]
  const timestamp = m[2]
  return { keyword, timestamp }
})

org.define('block.begin', /^\s*#\+begin_(\w+)(.*)$/i, m => {
  const type = m[1]
  const params = m[2].split(' ').map( str => str.trim()).filter(String)
  return { type, params }
})

org.define('block.end', /^\s*#\+end_(\w+)$/i, m => {
  const type = m[1]
  return { type }
})

org.define('drawer.end', /^\s*:end:\s*$/i)

org.define('drawer.begin', /^\s*:(\w+):\s*$/, m => {
  const type = m[1]
  return { type }
})

org.define('list.item', /^\s*([-+]|\d+[.)])\s+(.*)$/, m => {
  const bullet = m[1]
  const content = m[2]
  var ordered = true
  if ( [`-`, `+`].includes(bullet) ) {
    ordered = false
  }

  return { ordered, content }
})

org.define('table.separator', /^\s*\|-/)

org.define('table.row', /^\s*\|(\s*.+\|)+\s*$/, m => {
  const cells = m[1].split('|').map( str => str.trim()).filter(String)
  return { cells }
})

org.define('horizontalRule', /^\s*-{5,}\s*$/)

org.define('comment', /^\s*#\s.*$/)

org.define('footnote', /^\[fn:(\w+)\]:\s*(.*)$/, m => {
  const label = m[1]
  const content = m[2]
  return { label, content }
})

var inline = new Syntax()

function Lexer(options = require('./defaults')) {
  this.syntax = org
  const { todos } = options
  if (todos) {
    this.updateTODOs(todos)
  }
}

Lexer.prototype = {
  tokenize: function (input) {
    for ( const { name, pattern, post } of this.syntax.rules ) {
      const m = pattern.exec(input)
      if (!m) { continue }
      var token = { name, raw: input }
      token.data = post(m)
      return token
    }

    const trimed = input.trim()
    if (trimed === '') {
      return { name: `blank`, raw: input }
    }

    return { name: `line`, raw: input }
  },

  updateTODOs: function(todos) {
    this.syntax.update(`headline`, headlinePattern(todos))
  }

}

module.exports = Lexer
