import Prism from 'prismjs'
import loadPrismLanguage from './_load-prism-language'

module.exports = highlight

function highlight(language, code) {
  if (!Prism.languages[language]) {
    try {
      loadPrismLanguage(language)
    } catch (e) {
      // Language wasn't loaded so let's bail.
      return code
    }
  }
  const lang = Prism.languages[language]
  const highlighted = Prism.highlight(code, lang)
  return highlighted
}

