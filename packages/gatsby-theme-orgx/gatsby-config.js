const withDefaults = require('./utils/default-options')

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
        resolve: 'gatsby-plugin-orga',
      },
    ]
  }
}
