module.exports = {
  siteMetadata: {
    title: 'orgajs + gatsby',
    description: 'this is a website built with org-mode files',
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
