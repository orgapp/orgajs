module.exports = {
  siteMetadata: {
    title: "gatsby",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/src/pages/`,
      },
    },
    { resolve: 'gatsby-plugin-orga' },
  ],
};
