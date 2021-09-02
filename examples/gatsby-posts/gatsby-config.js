module.exports = {
  siteMetadata: {
    title: `Gatsby With Orga`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `Xiaoxing Hu`,
    twitter: 'xiaoxinghu',
    github: 'xiaoxinghu',
    siteUrl: `https://orga.js.org`,
    social: [
      { name: 'twitter', url: 'https://twitter.com/xiaoxinghu' },
      { name: 'website', url: 'https://huxiaoxing.com' },
      { name: 'email', url: 'mailto:contact@huxx.org' },
    ],
  },
  plugins: [
    {
      resolve: 'gatsby-theme-orga-posts',
    },
  ],
}
