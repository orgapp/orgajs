import { createFsFromVolume, Volume } from 'memfs';
import path from 'path';
import webpack from 'webpack';

export default (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    mode: 'none',
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.org$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                configFile: false,
                plugins: [
                  '@babel/plugin-transform-runtime',
                  '@babel/plugin-syntax-jsx',
                  '@babel/plugin-transform-react-jsx',
                ],
              },
            },
            // {
            //   loader: 'html-loader',
            // },
            // {
            //   loader: '@babel/plugin-transform-react-jsx',
            // },
            {
              loader: path.resolve(__dirname, '../lib'),
              options,
            }
          ],
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats)
      // resolve(stats.toJson().modules.find(m => m.name === fixture));
    });
  });
};
