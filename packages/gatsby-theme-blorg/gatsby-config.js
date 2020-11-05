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
      siteUrl: `https://orga.js.org`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
      twitter: '',
      github: '',
      email: '',
    },
    plugins: [
      {
        resolve: `gatsby-plugin-themes`,
        options: {
          pathToConfig: withThemePath(`./src/themes`),
        },
      },
      {
        resolve: `gatsby-theme-orga`,
        options: {
          ...options,
          metadata: [ 'title', `date(formatString: "MMMM Do, YYYY")`, 'tags', 'excerpt', ...options.metadata || [] ],
        },
      },
      `gatsby-plugin-offline`,
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
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: `src`,
          ignore: [`**/\.*`], // ignore files starting with a dot
        },
      },
    ],
  }
}
