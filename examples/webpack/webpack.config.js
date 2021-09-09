const toJsx = require('@orgajs/estree-jsx')
const toEstree = require('@orgajs/rehype-estree')
const toRehype = require('@orgajs/reorg-rehype')

module.exports = {
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
        use: [
          'babel-loader',
          {
            loader: '@orgajs/loader',
            options: {
              plugins: [toRehype, toEstree, toJsx],
            },
          },
        ],
      },
    ],
  },
}
