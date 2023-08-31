import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from '@codemirror/language'
import { parser, tags as t } from '@orgajs/lezer'

export const tags = t

const data = defineLanguageFacet({})

/**
 * @param {any} parser
 */
function mkLang(parser) {
  return new Language(data, parser, [], 'org')
}

export function org() {
  const lang = mkLang(parser)
  return new LanguageSupport(lang)
}
