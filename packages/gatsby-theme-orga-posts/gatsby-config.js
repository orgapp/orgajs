module.exports = (options) => {
  const { preset = '@theme-ui/preset-system' } = options

  return {
    siteMetadata: {
      title: `Blog Title Placeholder`,
      siteUrl: `https://orga.js.org`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
      twitter: 'xiaoxinghu',
      social: [
        { name: 'twitter', url: 'https://twitter.com/xiaoxinghu' },
        { name: 'website', url: 'https://huxiaoxing.com' },
        { name: 'email', url: 'mailto:contact@huxx.org' },
      ],
    },
    plugins: [
      {
        resolve: 'gatsby-theme-orga-posts-core',
        options: {
          ...options,
        },
      },
      `gatsby-plugin-react-helmet`,
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: `src`,
          ignore: ['**/.*'], // ignore files starting with a dot
        },
      },
      {
        resolve: 'gatsby-plugin-orga-theme-ui',
        options: {
          preset,
        },
      },
    ],
  }
}
