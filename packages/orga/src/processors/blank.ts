function _process(token, section) {
  var self = this
  self._cel++
  self.consume()
  if (section.type === `footnote` && self._cel > 1) return section
  self._aks = {}
  return self.parseSection(section)
}

module.exports = _process
