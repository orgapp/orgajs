import Prism from 'prism-react-renderer/prism'

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

export const escape = (str: string): string => {
  return str.replace(matchOperatorsRe, '\\$&')
}

const inline = (mark: string, ...alias: string[]) => {
  const m = escape(mark)
  return {
    pattern: RegExp(`${m}[^${m}]+${m}`),
    inside: {
      content: {
        pattern: /(^.)[\s\S]+(?=.$)/,
        lookbehind: true,
      },
      punctuation: RegExp(m),
    },
    alias: [...alias],
  }
}

function addOrgMode(Prism) {
  Prism.languages.org = {
    stars: {
      pattern: /^\*+\s+.*$/m,
      alias: 'important',
    },
    comment: /^\s*#\s+.*/m,
    'code-block': {
      pattern: /^#\+(begin|end)_.*$/im,
      alias: 'comment',
    },
    bold: inline('*'),
    italic: inline('/'),
    verbatim: inline('=', 'keyword'),
    code: inline('~', 'keyword'),
    underline: inline('_', 'inserted'),
    strike: inline('+', 'deleted'),
  }
}

addOrgMode(Prism)
