import { promisify } from 'util'
import { promises as fs } from 'fs'
import webpack from 'webpack'
import { fileURLToPath } from 'url'

export async function compile(fixture, options = {}) {
	const base = new URL('.', import.meta.url)

	const result = await promisify(webpack)({
		// @ts-expect-error TODO: webpack types miss support for `context`.
		context: fileURLToPath(base),
		entry: `./${fixture}`,
		mode: 'none',
		output: {
			path: fileURLToPath(base),
			filename: 'bundle.js',
		},
		module: {
			rules: [
				{
					test: /\.org$/,
					use: [
						// {
						//   loader: 'babel-loader',
						//   options: {
						//     configFile: false,
						//     plugins: [
						//       '@babel/plugin-transform-runtime',
						//       '@babel/plugin-syntax-jsx',
						//       '@babel/plugin-transform-react-jsx',
						//     ],
						//   },
						// },
						{
							// loader: path.resolve(__dirname, '../dist'),
							loader: fileURLToPath(new URL('../index.cjs', import.meta.url)),
							options,
						},
					],
				},
			],
		},
	})

	// cleanup
	await fs.unlink(new URL('bundle.js', base))
	return result
}
