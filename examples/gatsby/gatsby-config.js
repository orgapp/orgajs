module.exports = {
  siteMetadata: {
    title: "orgajs/gatsby",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `posts`,
        path: `${__dirname}/posts/`,
      },
    },
    { resolve: 'gatsby-plugin-orga' },
  ],
};
