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
}

var org = new Syntax()

org.define('headline', /^(\*+)\s+(TODO|DONE)?(?:\s+\[#(A|B|C)\])?(.*?)\s*(:(?:\w+:)+)?$/, (m) => {
  const level = m[1].length
  const keyword = m[2]
  const priority = m[3]
  const content = m[4]
  const tags = (m[5] || '').split(':').map( str => str.trim()).filter(String)
  return { level, keyword, priority, content, tags }
})

org.define('keyword', /^\s*#\+(\w+):\s*(.*)$/, (m) => {
  const key = m[1]
  const value = m[2]
  return { key, value }
})

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']
org.define('planning', RegExp(`^\\s*(${PLANNING_KEYWORDS.join('|')}):\\s*(.+)$`), (m) => {
  const keyword = m[1]
  const timestamp = m[2]
  return { keyword, timestamp }
})

org.define('block.begin', /^\s*#\+begin_(\w+)(.*)$/i, (m) => {
  const type = m[1]
  const params = m[2].split(' ').map( str => str.trim()).filter(String)
  return { type, params }
})

org.define('block.end', /^\s*#\+end_(\w+)$/i, (m) => {
  const type = m[1]
  return { type }
})

org.define('drawer.end', /^\s*:end:\s*$/i)

org.define('drawer.begin', /^\s*:(\w+):\s*$/, (m) => {
  const type = m[1]
  return { type }
})

org.define('list.item', /^\s*([-+]|\d+[.)])\s+(.*)$/, (m) => {
  const bullet = m[1]
  const content = m[2]
  var ordered = true
  if ( [`-`, `+`].includes(bullet) ) {
    ordered = false
  }

  return { ordered, content }
})

org.define('table.separator', /^\s*\|-/)

org.define('table.row', /^\s*\|(\s*.+\|)+\s*$/, (m) => {
  const cells = m[1].split('|').map( str => str.trim()).filter(String)
  return { cells }
})

org.define('horizontalRule', /^\s*-{5,}\s*$/)

org.define('comment', /^\s*#\s.*$/)

org.define('footnote', /^\[fn:(\w+)\]:\s*(.*)$/, (m) => {
  const label = m[1]
  const content = m[2]
  return { label, content }
})

function Lexer() {
}

Lexer.prototype = {
  tokenize: function (line) {
    for ( const { name, pattern, post } of org.rules ) {
      const m = pattern.exec(line)
      if (!m) { continue }
      var token = { name }
      token.data = post(m)
      return token
    }

    const trimed = line.trim()
    if (trimed === '') {
      return { name: `blank` }
    }

    return { name: `line`, content: trimed }
  }
}

module.exports = Lexer
