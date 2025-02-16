/**
 * @import {Options as LoaderOptions} from '@orgajs/loader'
 */

/**
 * @typedef {LoaderOptions & {
	 extension: RegExp
	 }} Options
 */

const plugin =
	(/** @type {Partial<Options>} */ options = {}) =>
	(/** @type {any} */ nextConfig = {}) => {
		const extension = options.extension || /\.org$/

		const loader = {
			loader: '@orgajs/loader',
			options: {
				providerImportSource: 'next-orga-import-source-file',
				...options,
			},
		}

		return Object.assign({}, nextConfig, {
			webpack(/** @type {any} */ config, /** @type {any} */ options) {
				config.resolve.alias['next-orga-import-source-file'] = [
					'private-next-root-dir/src/org-components',
					'private-next-root-dir/org-components',
					'@orgajs/react',
				]
				config.module.rules.push({
					test: extension,
					use: [options.defaultLoaders.babel, loader],
				})

				if (typeof nextConfig.webpack === 'function') {
					return nextConfig.webpack(config, options)
				}

				return config
			},
		})
	}

export default plugin
