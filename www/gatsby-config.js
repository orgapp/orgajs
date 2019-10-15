module.exports = {
  siteMetadata: {
    title: 'Orga',
  },
  plugins: [
    {
      resolve: `gatsby-theme-orga`,
      options: {
        // basePath: '/docs',
        contentPath: `../docs`,
        // filter: {
        //   category: `docs`,
        // },
      },
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-styled-components`,
    'gatsby-transformer-sharp',
    'gatsby-transformer-toml',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      }
    },
  ],
}
