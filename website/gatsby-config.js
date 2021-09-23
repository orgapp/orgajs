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
          Notice: require.resolve('./src/components/notice.tsx'),
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
