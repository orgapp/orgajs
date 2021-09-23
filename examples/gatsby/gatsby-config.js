module.exports = {
  siteMetadata: {
    title: 'orgajs + gatsby',
    description: 'this is a website built with org-mode files',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-orga',
      options: {
        components: {
          // override a inorder to have better internal navigation
          a: require.resolve('./src/components/link.tsx'),
        },
      },
    },
  ],
}
