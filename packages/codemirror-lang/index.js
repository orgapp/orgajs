import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from '@codemirror/language'
import { parser } from '@orgajs/lezer'

const data = defineLanguageFacet({})

/**
 * @param {any} parser
 */
function mkLang(parser) {
  return new Language(data, parser, [], 'org')
}

/**
 * @param {{}} [config]
 */
export function org() {
  const lang = mkLang(parser)
  return new LanguageSupport(lang)
}
