module.exports = {
  siteMetadata: {
    title: 'orgajs + gatsby + theme-ui',
    description: 'this is a website built with org-mode files',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-orga',
      options: {
        pragma: { name: 'jsx', source: 'theme-ui' },
        pragmaFrag: { name: 'Fragment', source: 'react' },
        defaultLayout: require.resolve('./src/components/layout.tsx'),
      },
    },
    {
      resolve: 'gatsby-plugin-orga-theme-ui',
      options: {
        preset: '@theme-ui/preset-system',
        prismPreset: 'github',
      },
    },
  ],
}
