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
          defaultLayout: require.resolve('./src/components/layout.js'),
        },
      },
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
          path: 'docs',
        }
      },
    ]
  }
}