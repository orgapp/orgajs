const path = require('path')

const withThemePath = relativePath => {
  let pathResolvedPath = path.resolve(relativePath)
  let finalPath = pathResolvedPath
  try {
    // check if the user's site has the file
    require.resolve(pathResolvedPath)
  } catch (e) {
    // if the user hasn't implemented the file,
    finalPath = require.resolve(relativePath)
  }
  return finalPath
}

module.exports = options => {

  return {
    plugins: [
      {
        resolve: `gatsby-theme-orga`,
        options: {
          metadata: [ 'title', 'date', 'tags', 'description' ],
          ...options,
        },
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-emotion`,
      {
        resolve: `gatsby-plugin-typography`,
        options: {
          pathToConfigModule: withThemePath(`./src/typography`),
        },
      },
      {
        resolve: `gatsby-plugin-themes`,
        options: {
          pathToConfig: withThemePath(`./src/themes`),
        },
      }
    ],
  }
}
