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
  const tags = m[5]
  return { level, keyword, priority, content, tags }
})

org.define('keyword', /^\s*#\+(\w+):\s*(.*)$/, (m) => {
  const key = m[1]
  const value = m[2]
  return { key, value }
})

const PLANNING_KEYWORDS = ['DEADLINE', 'SCHEDULED', 'CLOSED']
org.define('planning', RegExp(`^\s*(${PLANNING_KEYWORDS.join('|')}):\s*(.+)$`), (m) => {
  const keyword = m[1]
  const timestamp = m[2]
  return { keyword, timestamp }
})

function Lexer() {
}

Lexer.prototype = {
  tokenize: function (line) {
    for ( const { name, pattern, post } of org.rules ) {
      const m = pattern.exec(line)
      if (!m) { continue }
      var token = { name }
      return Object.assign(token, post(m))
    }

    return { name: `line` }
  }
}

module.exports = Lexer
