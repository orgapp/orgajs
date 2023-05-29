const withOrga = require('@orgajs/next').default({})

module.exports = withOrga({
  pageExtensions: ['js', 'jsx', 'tsx', 'org'],
})
