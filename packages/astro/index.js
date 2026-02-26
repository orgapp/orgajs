/**
 * @typedef {import('astro').HookParameters<'astro:config:setup'> & {
 *   addPageExtension: (ext: string) => void;
 *   addContentEntryType: (contentEntryType: import('astro').ContentEntryType) => void;
 * }} SetupHookParams
 * @typedef {import('@orgajs/orgx').CompileOptions} Options
 */

import { parse as parseMetadata } from '@orgajs/metadata'
import orga from '@orgajs/rollup'
import astroJSXRenderer from 'astro/jsx/renderer.js'
import { addAstroFragment } from './lib/plugin/recma-add-astro-fragment.js'

/**
 * @param {Options} options
 * @returns {import('astro').AstroIntegration}
 */
export default function org({ recmaPlugins, ...options }) {
	return {
		name: '@orgajs/astro',
		hooks: {
			// @ts-expect-error
			async 'astro:config:setup'(/** @type {SetupHookParams} */ parameters) {
				const {
					addPageExtension,
					addContentEntryType,
					updateConfig,
					addRenderer
				} = parameters
				addPageExtension('.org')
				addRenderer(astroJSXRenderer)

				addContentEntryType({
					extensions: ['.org'],
					async getEntryInfo({ contents }) {
						const data = parseMetadata(contents)

						return {
							data,
							body: contents,
							rawData: JSON.stringify(data),
							slug: Array.isArray(data.slug) ? data.slug[0] : data.slug
						}
					},
					handlePropagation: true
				})

				// Future: add org-components support
				// const components = new URL('org-components', config.srcDir)

				updateConfig({
					vite: {
						plugins: [
							{
								enforce: 'pre',
								...orga({
									...options,
									jsxImportSource: 'astro',
									// ProviderImportSource: components.pathname,
									recmaPlugins: [...(recmaPlugins ?? []), addAstroFragment],
									elementAttributeNameCase: 'html',
									development: false
								}),
								// @ts-expect-error
								configResolved(resolved) {
									// HACK: move ourselves before Astro's JSX plugin to transform things in the right order
									const jsxPluginIndex = resolved.plugins.findIndex(
										// @ts-expect-error
										(p) => p.name === 'astro:jsx'
									)
									if (jsxPluginIndex !== -1) {
										const myPluginIndex = resolved.plugins.findIndex(
											// @ts-expect-error
											(p) => p.name === '@orgajs/rollup'
										)
										if (myPluginIndex !== -1) {
											const myPlugin = resolved.plugins[myPluginIndex]
											resolved.plugins.splice(myPluginIndex, 1)
											resolved.plugins.splice(jsxPluginIndex, 0, myPlugin)
										}
									}
								}
							},
							{
								name: '@orgajs/org-postprocess',
								/**
								 * @param {string} code
								 * @param {string} id
								 */
								transform(code, id) {
									if (!id.endsWith('.org')) {
										return
									}

									return { code, map: null }
								}
							}
						]
					}
				})
			}
		}
	}
}
