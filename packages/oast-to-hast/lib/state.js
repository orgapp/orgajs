/**
 * @typedef {import('hast').Nodes} HastNodes
	 @import {ElementContent as HastElementContent,Root as HastRoot} from 'hast'
 * @typedef {import('orga').Parent} OastParent
 * @typedef {import('orga').Nodes} OastNodes
 */

/**
 * @typedef {Object} Config
 * @property {Handlers} handlers
 * @property {string} linkTarget
 * @property {(link: import('orga').Link) => string} linkHref
 * @property {string[]} selectTags=[]
 * @property {string[]} excludeTags=['noexport']
 */

/**
 * @typedef {ReturnType<typeof createState>} State
 *
 * @callback Handler
 * @param {State} state
 * @param {any} node
 * @param {OastParent | undefined} parent
 * @returns {Array<HastElementContent> | HastElementContent | HastRoot | undefined}
 *   hast node.
 *
 * @typedef {Partial<Record<OastNodes['type'], Handler>>} Handlers
 *   Handle nodes.
 */

import { position } from 'unist-util-position'
import { handlers as defaultHandlers } from './handlers/index.js'

/**
 * @param {OastNodes} tree
 * @param {Partial<Config> | null | undefined} [options = {}]
 */
export function createState(tree, options = {}) {
	/** @type {Handlers} */
	let handlers = { ...defaultHandlers }
	if (options?.handlers) {
		handlers = { ...handlers, ...options.handlers }
	}

	const state = {
		one,
		all,
		handlers,
		getAttrHtml,
		patch,
		/** @type {Config} */
		options: {
			handlers,
			linkTarget: '_self',
			selectTags: [],
			excludeTags: ['noexport'],
			linkHref: (link) => link.path.value,
			...options
		}
	}

	return state

	/**
	 * @param {OastNodes} parent
	 * @returns {Array<HastElementContent>}
	 */
	function all(parent) {
		/** @type {Array<HastElementContent>} */
		const values = []
		if ('children' in parent) {
			parent.children.forEach((node) => {
				const result = one(node, parent)
				if (!result) {
					return
				}
				if (Array.isArray(result)) {
					values.push(...result)
				} else {
					// @ts-expect-error: can never be Root here
					values.push(result)
				}
			})
		}
		return values
	}

	/**
	 * @param {OastNodes} node
	 * @param {OastParent | undefined} parent
	 */
	function one(node, parent = undefined) {
		const handle = handlers[node.type] || unkownHandler
		return handle(state, node, parent)
	}

	/**
	 * @param {OastNodes} node
	 * @returns {Record<string, string> | undefined}
	 */
	function getAttrHtml(node) {
		if ('properties' in node && 'attr_html' in node.properties) {
			const a = node.properties.attr_html
			if (typeof a === 'string') return
			if (Array.isArray(a)) return
			return a
		}
	}

	/**
	 * @template {HastNodes} T
	 * @param {OastNodes} from
	 * @param {T} to
	 * @returns {T}
	 */
	function patch(from, to) {
		if (from.position) {
			to.position = position(from)
		}
		return to
	}
}

/** @type {Handler} */
function unkownHandler(state, node) {
	if (node && node.children) {
		return {
			type: 'element',
			tagName: 'div',
			properties: {},
			children: state.all(node)
		}
	} else if ('value' in node) {
		return { type: 'text', value: `${node.value}` }
	}
	return undefined
}
