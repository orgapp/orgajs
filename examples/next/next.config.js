/* eslint-disable @typescript-eslint/no-var-requires */
const codeHighlight = require('@orgajs/reorg-shiki').default
const path = require('path')
const withOrga = require('@orgajs/next')({
  reorg: {
    plugins: [
      [
        codeHighlight,
        {
          langs: [
            {
              id: 'org',
              scopeName: 'source.org',
              path: path.resolve(__dirname, 'org.tmLanguage.json'),
            },
          ],
        },
      ],
    ],
  },
  estree: {
    defaultLayout: require.resolve('./components/layout.tsx'),
  },
})

module.exports = withOrga({
  pageExtensions: ['js', 'jsx', 'tsx', 'org'],
})
