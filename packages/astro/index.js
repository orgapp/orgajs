/**
 * @typedef {import('astro').HookParameters<'astro:config:setup'> & {
 *   addPageExtension: (ext: string) => void;
 *   addContentEntryType: (contentEntryType: import('astro').ContentEntryType) => void;
 * }} SetupHookParams
 */
import orga from '@orgajs/rollup'
import { parse as parseMetadata } from '@orgajs/metadata'

/**
 * @returns {import('astro').AstroIntegration}
 */
export default function withOrga() {
  return {
    name: '@orgajs/astro',
    hooks: {
      'astro:config:setup': async (params) => {
        const { addPageExtension, addContentEntryType, updateConfig } =
          /** @type {SetupHookParams} */ params
        addPageExtension('.org')

        addContentEntryType({
          extensions: ['.org'],
          async getEntryInfo({ contents }) {
            const data = parseMetadata(contents)
            return {
              data,
              contents,
            }
          },
        })

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                ...orga(),
              },
            ],
          },
        })
      },
    },
  }
}
