const withDefaults = require('./utis/default-options')

module.exports = themeOptions => {
  const options = withDefaults(themeOptions)
  return {
    siteMetadata: {
      title: `Title Placeholder`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
    },
    plugins: [
      {
        resolve: `gatsby-transformer-orga`,
        options: {},
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: options.contentPath,
          path: options.contentPath,
        },
      },
    ]
  }
}
