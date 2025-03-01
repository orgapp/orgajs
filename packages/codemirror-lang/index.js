/** @typedef {import('@lezer/common').SyntaxNode} SyntaxNode */

import {
	defineLanguageFacet,
	foldNodeProp,
	foldService,
	Language,
	LanguageSupport,
	syntaxTree
} from '@codemirror/language'
import { NodeProp } from '@lezer/common'
import { parser as baseParser } from '@orgajs/lezer'

const data = defineLanguageFacet({})

// --- folding ---
/** @type {NodeProp<number>} */
const headlineProperty = new NodeProp()

/**
 * @param {import('@lezer/common').NodeType} type
 */
function isHeadline(type) {
	const match = /^headline(\d)$/.exec(type.name)
	return match ? Number(match[1]) : undefined
}

/**
 * @param {SyntaxNode} headerNode
 * @param {number} level
 */
function findSectionEnd(headerNode, level) {
	let last = headerNode
	for (;;) {
		const next = last.nextSibling
		if (!next) {
			break
		}

		const headline = isHeadline(next.type)
		if (headline !== undefined && headline <= level) {
			return next.from - 1 // Escape the newline. TODO: is this safe?
		}

		last = next
	}

	return last.to
}

const headerIndent = foldService.of((state, start, end) => {
	for (
		let /** @type {SyntaxNode | null} */ node = syntaxTree(state).resolveInner(
				end,
				-1
			);
		node;
		node = node.parent
	) {
		if (node.from < start) {
			break
		}

		const headline = node.type.prop(headlineProperty)
		if (!headline) {
			continue
		}

		const upto = findSectionEnd(node, headline)
		if (upto > end) {
			return { from: end, to: upto }
		}
	}

	return null
})

const parser = baseParser.configure({
	props: [
		foldNodeProp.add((type) => {
			const m = isHeadline(type)
			if (!m) {
				return undefined
			}

			return (tree, state) => ({
				from: state.doc.lineAt(tree.from).to,
				to: state.doc.lineAt(tree.from).to
			})
		}),
		headlineProperty.add(isHeadline)
	]
})

/**
 * @param {any} parser
 */
function mkLang(parser) {
	return new Language(data, parser, [headerIndent], 'org')
}

export function org() {
	const lang = mkLang(parser)
	return new LanguageSupport(lang)
}

export { tags } from '@orgajs/lezer'
