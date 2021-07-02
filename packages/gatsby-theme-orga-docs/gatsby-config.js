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
            Box: require.resolve('./src/components/box.tsx'),
            ...options.components,
          }
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `images`,
          path: path.join(__dirname, `src`, `images`),
        },
      },
      `gatsby-plugin-sharp`,
      `gatsby-transformer-sharp`,
      // {
      //   resolve: 'gatsby-source-filesystem',
      //   options: {
      //     path: 'docs',
      //     name: 'docs',
      //   },
      // },
      {
        resolve: 'gatsby-plugin-page-creator',
        options: {
          path: path.join(__dirname, 'src/pages')
        }
      },
      {
        resolve: 'gatsby-plugin-page-creator',
        options: {
          path: '../docs',
        }
      },
      {
        resolve: 'gatsby-plugin-theme-ui',
      },
    ],
  }
}
