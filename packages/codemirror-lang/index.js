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
 * @param {SyntaxNode} section
 * @param {import('@codemirror/state').EditorState} state
 */
function findSectionEnd(section, state) {
	// Check if there's a newline at section.to and adjust accordingly
	if (section.to > 0 && section.to <= state.doc.length) {
		const charAtEnd = state.doc.sliceString(section.to - 1, section.to)
		if (charAtEnd === '\n') {
			return section.to - 1
		}
	}

	return section.to
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
		const section = node.parent
		if (!section) {
			continue
		}

		const upto = findSectionEnd(section, state)
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
