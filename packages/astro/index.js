/**
 * @typedef {import('astro').HookParameters<'astro:config:setup'> & {
 *   addPageExtension: (ext: string) => void;
 *   addContentEntryType: (contentEntryType: import('astro').ContentEntryType) => void;
 * }} SetupHookParams
 * @typedef {import('@orgajs/orgx').CompileOptions} Options
 */
import orga from '@orgajs/rollup'
import { parse as parseMetadata } from '@orgajs/metadata'
import { addAstroFragment } from './lib/plugin/recma-add-astro-fragment.js'

/**
 * @param {Options} options
 * @returns {import('astro').AstroIntegration}
 */
export default function org({ recmaPlugins, ...options }) {
  return {
    name: '@orgajs/astro',
    hooks: {
      // @ts-ignore - addPageExtension, addContentEntryType are internal APIs
      'astro:config:setup': async (/** @type {SetupHookParams} */ params) => {
        const { addPageExtension, addContentEntryType, updateConfig } = params
        addPageExtension('.org')

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
        })

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                ...orga({
                  ...options,
                  jsxImportSource: 'astro',
                  recmaPlugins: [...(recmaPlugins ?? []), addAstroFragment],
                  elementAttributeNameCase: 'html',
                  development: false,
                }),
              },
              {
                name: '@orgajs/org-postprocess',
                /**
                 * @param {string} code
                 * @param {string} id
                 */
                transform(code, id) {
                  if (!id.endsWith('.org')) return
                  // console.log(code)
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
