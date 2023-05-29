export default {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.org$/,
        use: ['@orgajs/loader'],
      },
    ],
  },
}
