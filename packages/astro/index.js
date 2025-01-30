/**
 * @typedef {import('astro').HookParameters<'astro:config:setup'> & {
 *   addPageExtension: (ext: string) => void;
 *   addContentEntryType: (contentEntryType: import('astro').ContentEntryType) => void;
 * }} SetupHookParams
 * @typedef {import('@orgajs/orgx').CompileOptions} Options
 */
import orga from '@orgajs/rollup'
import { parse as parseMetadata } from '@orgajs/metadata'
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
      // @ts-ignore
      'astro:config:setup': async (/** @type {SetupHookParams} */ params) => {
        const {
          addPageExtension,
          addContentEntryType,
          updateConfig,
          addRenderer,
        } = params
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
              slug: Array.isArray(data.slug) ? data.slug[0] : data.slug,
            }
          },
          handlePropagation: true,
        })

        // TODO: add org-components support
        // const components = new URL('org-components', config.srcDir)

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                ...orga({
                  ...options,
                  jsxImportSource: 'astro',
                  // providerImportSource: components.pathname,
                  recmaPlugins: [...(recmaPlugins ?? []), addAstroFragment],
                  elementAttributeNameCase: 'html',
                  development: false,
                }),
                // @ts-ignore
                configResolved(resolved) {
                  // HACK: move ourselves before Astro's JSX plugin to transform things in the right order
                  const jsxPluginIndex = resolved.plugins.findIndex(
                    // @ts-ignore
                    (p) => p.name === 'astro:jsx'
                  )
                  if (jsxPluginIndex !== -1) {
                    const myPluginIndex = resolved.plugins.findIndex(
                      // @ts-ignore
                      (p) => p.name === '@orgajs/rollup'
                    )
                    if (myPluginIndex !== -1) {
                      const myPlugin = resolved.plugins[myPluginIndex]
                      // @ts-ignore-error ignore readonly annotation
                      resolved.plugins.splice(myPluginIndex, 1)
                      // @ts-ignore-error ignore readonly annotation
                      resolved.plugins.splice(jsxPluginIndex, 0, myPlugin)
                    }
                  }
                },
              },
              {
                name: '@orgajs/org-postprocess',
                /**
                 * @param {string} code
                 * @param {string} id
                 */
                transform(code, id) {
                  if (!id.endsWith('.org')) return
                  return { code, map: null }
                },
              },
            ],
          },
        })
      },
    },
  }
}
