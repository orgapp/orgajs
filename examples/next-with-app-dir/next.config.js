const rehypePrettyCode = require('rehype-pretty-code')
const withOrga = require('@orgajs/next').default({
  rehypePlugins: [
    [rehypePrettyCode, { theme: 'one-dark-pro', keepBackground: true }],
  ],
})

module.exports = withOrga({
  pageExtensions: ['js', 'jsx', 'tsx', 'org'],
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
})
