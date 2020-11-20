module.exports = options => {

  const {
    preset = 'orga-theme-ui-preset',
  } = options

  return {
    siteMetadata: {
      title: `Blog Title Placeholder`,
      siteUrl: `https://orga.js.org`,
      author: `Name Placeholder`,
      description: `Description placeholder`,
      twitter: 'xiaoxinghu',
      social: [
        { name: 'twitter', url: 'https://twitter.com/xiaoxinghu' },
        { name: 'website', url: 'https://huxiaoxing.com' },
        { name: 'email', url: 'mailto:contact@huxiaoxing.com' },
      ],
    },
    plugins: [
      {
        resolve: `gatsby-plugin-typescript`,
        options: {
          isTSX: true, // defaults to false
          jsxPragma: `jsx`, // defaults to "React"
          allExtensions: true, // defaults to false
        },
      },
      {
        resolve: 'gatsby-theme-orga',
        options: {
          ...options,
        },
      },
      `gatsby-plugin-offline`,
      `gatsby-plugin-react-helmet`,
      `gatsby-plugin-emotion`,
      `gatsby-transformer-sharp`,
      `gatsby-transformer-toml`,
      `gatsby-plugin-sharp`,
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: `src`,
          ignore: [`**/\.*`], // ignore files starting with a dot
        },
      },
      {
        resolve: 'gatsby-plugin-theme-ui',
        options: {
          preset: preset,
        }
      },
    ],
  }
}
