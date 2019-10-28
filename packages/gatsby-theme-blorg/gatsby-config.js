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
    siteMetadata: {
      title: `Blog Title Placeholder`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
    },
    plugins: [
      {
        resolve: `gatsby-theme-orga`,
        options: {
          ...options,
          metadata: [ 'title', 'date', 'tags', 'description', ...options.metadata || [] ],
        },
      },
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-emotion`,
      `gatsby-transformer-sharp`,
      `gatsby-transformer-toml`,
      `gatsby-plugin-sharp`,
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
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `assets`,
          path: `${__dirname}/assets`,
          ignore: [`**/\.*`], // ignore files starting with a dot
        },
      },
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: `${__dirname}/src/data`,
          ignore: [`**/\.*`], // ignore files starting with a dot
        },
      },
    ],
  }
}
