const path = require('path')
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
        options: {
          defaultLayout: require.resolve('./src/components/layout.tsx'),
          components: {
            ...options.components,
          }
        },
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-image`,
      `gatsby-plugin-sharp`,
      `gatsby-transformer-sharp`,
      {
        resolve: 'gatsby-plugin-page-creator',
        options: {
          path: path.join(__dirname, 'src/pages')
        }
      },
      ...options.location.map(path => ({
        resolve: 'gatsby-plugin-page-creator',
        options: { path },
      })),
      {
        resolve: 'gatsby-plugin-theme-ui',
      },
    ],
  }
}
