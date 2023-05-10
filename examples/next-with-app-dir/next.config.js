// const codeHighlight = require('@orgajs/reorg-shiki').default
// const path = require('path')
const withOrga = require('@orgajs/next').default({
  // defaultLayout: require.resolve('./components/layout.tsx'),
  reorgPlugins: [
    // [
    //   codeHighlight,
    //   {
    //     langs: [
    //       {
    //         id: 'org',
    //         scopeName: 'source.org',
    //         path: path.resolve(__dirname, 'org.tmLanguage.json'),
    //       },
    //     ],
    //   },
    // ],
  ],
})

module.exports = withOrga({
  pageExtensions: ['js', 'jsx', 'tsx', 'org'],
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
})
