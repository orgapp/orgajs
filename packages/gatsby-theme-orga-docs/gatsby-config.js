const defaultOptions = {
  location: ['docs'],
  imageMaxWidth: 1380,
  components: {},
}

module.exports = (themeOptions) => {
  const options = {
    ...defaultOptions,
    ...themeOptions,
  }
  return {
    siteMetadata: {
      title: `Title Placeholder`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
    },
    plugins: [
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-image`,
      `gatsby-plugin-sharp`,
      `gatsby-transformer-sharp`,
      {
        resolve: 'gatsby-plugin-orga',
        options: {
          defaultLayout: require.resolve('./src/components/layout.tsx'),
          components: {
            ...options.components,
          },
        },
      },
      ...options.location.map((path) => ({
        resolve: 'gatsby-plugin-page-creator',
        options: { path },
      })),
      ...options.location.map((path) => ({
        resolve: 'gatsby-source-filesystem',
        options: { path },
      })),
      {
        resolve: 'gatsby-plugin-orga-theme-ui',
        options: {
          preset: '@theme-ui/preset-system',
          prismPreset: 'github',
        },
      },
    ],
  }
}
