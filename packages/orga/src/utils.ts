import type { PhrasingContent, Token } from './types.js'

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

const escapeRegExp = (str: string): string => {
	return str.replace(matchOperatorsRe, '\\$&')
}

export { escapeRegExp, escapeRegExp as escape }

export const clone = (obj: any) => {
	return JSON.parse(JSON.stringify(obj))
}

export const isPhrasingContent = (token: Token): token is PhrasingContent => {
	return (
		token.type === 'text' ||
		token.type === 'footnote.reference' ||
		token.type === 'opening' ||
		token.type === 'link' ||
		token.type === 'newline'
	)
}
