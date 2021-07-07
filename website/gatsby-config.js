module.exports = {
  siteMetadata: {
    title: "orgajs",
  },
  // flags: {
  //   DEV_SSR: false,
  //   FAST_DEV: false,
  //   PRESERVE_FILE_DOWNLOAD_CACHE: false,
  //   PARALLEL_SOURCING: false,
  //   LMDB_STORE: false,
  // },
  plugins: [
    {
      resolve: 'gatsby-theme-orga-docs',
      options: {
        locations: ['../docs'],
        components: {
          Space: require.resolve('./src/components/space.tsx'),
          Notice: require.resolve('./src/components/notice.tsx'),
        },
      },
    },
  ],
};
