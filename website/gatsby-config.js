const path = require('path')

module.exports = {
  siteMetadata: {
    title: 'Orga',
    titleTemplate: '%s | orga.js.org',
    description: 'org-mode + JavaScript = 🚀',
    url: 'orga.js.org',
    image: '/images/logo.png',
    twitterUsername: '@xiaoxinghu',
  },
  // flags: {
  //   DEV_SSR: false,
  //   FAST_DEV: false,
  //   PRESERVE_FILE_DOWNLOAD_CACHE: false,
  //   PARALLEL_SOURCING: false,
  //   LMDB_STORE: false,
  // },
  plugins: [
    {
      resolve: 'gatsby-theme-orga-docs',
      options: {
        location: ['../docs'],
        components: {
          Space: require.resolve('./src/components/space.tsx'),
          Notice: require.resolve('./src/components/notice.tsx'),
          CodeBlock: require.resolve('./src/components/code-block/index.tsx'),
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `images`),
      },
    },
  ],
}
