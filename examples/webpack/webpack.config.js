import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import toJsx from '@orgajs/estree-jsx'

const config = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.org$/,
        use: [
          'babel-loader',
          {
            loader: '@orgajs/loader',
            options: {
              plugins: [
                toRehype,
                toEstree,
                toJsx,
              ]
            }
          }],
      },
    ]
  },
}

export default config
