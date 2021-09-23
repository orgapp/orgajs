const withOrga = require('@orgajs/next').default({
  jsxImportSource: 'theme-ui',
  defaultLayout: require.resolve('./components/layout.tsx'),
})

module.exports = withOrga({
  pageExtensions: ['js', 'jsx', 'tsx', 'org'],
})
