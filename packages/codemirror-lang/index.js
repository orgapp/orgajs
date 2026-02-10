/** @typedef {import('@lezer/common').SyntaxNode} SyntaxNode */

import {
	defineLanguageFacet,
	foldNodeProp,
	foldService,
	Language,
	LanguageSupport,
	syntaxTree
} from '@codemirror/language'
import { parser as baseParser } from '@orgajs/lezer'

const data = defineLanguageFacet({})

// --- folding ---

/**
 * @param {SyntaxNode} node
 */
function getHeadlineLevel(node) {
	if (node.type.name !== 'headline') return
	const stars = node.getChild('stars')
	if (stars) {
		const level = stars?.to - stars?.from
		return level
	}
}

/**
 * @param {SyntaxNode} headerNode
 */
function findSectionEnd(headerNode) {
	const level = getHeadlineLevel(headerNode)
	if (level === undefined) throw new Error('Not a headline')
	let last = headerNode
	for (;;) {
		const next = last.nextSibling
		if (!next) {
			break
		}

		const l = getHeadlineLevel(next)
		if (l !== undefined && l <= level) {
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

		if (!node.type.name.startsWith('headline')) {
			continue
		}

		const upto = findSectionEnd(node)
		if (upto > end) {
			return { from: end, to: upto }
		}
	}

	return null
})

const parser = baseParser.configure({
	props: [
		foldNodeProp.add((type) => {
			if (type.name !== 'headline') {
				return undefined
			}

			return (tree, state) => ({
				from: state.doc.lineAt(tree.from).to,
				to: state.doc.lineAt(tree.from).to
			})
		})
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
