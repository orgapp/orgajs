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
    ],
  }
}
