function Node(type, children = []) {
  this.type = type
  this.children = children
}

Node.prototype = {
  with: function(data) {
    var newNode = this
    newNode = Object.assign(this, data)
    return newNode
  }
}

module.exports = Node
