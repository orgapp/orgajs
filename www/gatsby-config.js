module.exports = {
  siteMetadata: {
    title: 'Orga',
  },
  plugins: [
    {
      resolve: `gatsby-theme-orga`,
      options: {
        contentPath: `../docs`,
        buildIndexPage: false,
        metadata: [ 'title', 'description', 'date' ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `assets`,
        path: `${__dirname}/../assets/`,
      },
    },
    'gatsby-plugin-react-helmet',
    `gatsby-plugin-styled-components`,
    'gatsby-transformer-sharp',
    'gatsby-transformer-toml',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'orgajs',
        short_name: 'orgajs',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: '../assets/logo.png',
      },
    },
  ],
}
