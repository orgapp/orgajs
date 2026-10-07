import { createContext, useContext } from 'react'
import { renderToString } from 'react-dom/server'

/** Set while rendering inside an island: nested islands render inline. */
const InsideIsland = createContext(false)

/** @type {(src: string) => string} */
let resolveUrl = (src) => src
let islandCount = 0

/**
 * Start rendering a page: set how an island's source path (relative to the
 * Vite root) becomes the URL the browser imports it from, and restart the
 * per-page island numbering.
 *
 * @param {(src: string) => string} fn
 */
export function beginPage(fn) {
	resolveUrl = fn
	islandCount = 0
}

/**
 * Server-side wrapper for a `'use client'` export. Components render inside an
 * `<orga-island>` that tells the client runtime what to import and hydrate;
 * other exports pass through unchanged.
 *
 * Each island is rendered as its own React tree with its own `identifierPrefix`,
 * matching how the browser hydrates it, so `useId` values line up.
 *
 * Props are serialized as JSON, so functions and `children` can't cross to the
 * browser. The `client` prop picks when to hydrate: `load` (default) or
 * `visible`.
 *
 * @template T
 * @param {T} Component
 * @param {string} src - Source path relative to the Vite root
 * @param {string} name - Export name
 * @returns {T}
 */
export function island(Component, src, name) {
	if (isType(Component, 'react.lazy')) {
		throw new Error(
			`<${name}> from ${src}: a lazy() component can't be an island because it can't be prerendered, use lazy() inside the island instead`
		)
	}
	if (!isComponent(Component)) return Component
	const Island = ({ client = 'load', ...props }) => {
		// An island inside another island is already client code.
		if (useContext(InsideIsland)) return <Component {...props} />
		/** @param {string} key */
		const reject = (key) => {
			throw new Error(
				`<${name}> from ${src} is an island: prop "${key}" can't be sent to the browser, pass JSON-serializable props only`
			)
		}
		if ('children' in props) reject('children')
		const json = JSON.stringify(props, (key, value) =>
			typeof value === 'function' ? reject(key) : value
		)
		const prefix = `island-${islandCount++}-`
		// Render from the serialized props: the browser sees exactly these.
		const html = renderToString(
			<InsideIsland value={true}>
				<Component {...JSON.parse(json)} />
			</InsideIsland>,
			{ identifierPrefix: prefix }
		)
		return (
			<orga-island
				src={resolveUrl(src)}
				export={name}
				props={json}
				prefix={prefix}
				client={client}
				style={{ display: 'contents' }}
				// biome-ignore lint/security/noDangerouslySetInnerHtml: markup React just rendered for this island
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		)
	}
	return /** @type {T} */ (/** @type {unknown} */ (Island))
}

/**
 * @param {unknown} value
 * @param {string} type - A `$$typeof` symbol description, e.g. `react.memo`
 */
function isType(value, type) {
	return (
		typeof value === 'object' &&
		value !== null &&
		/** @type {any} */ (value).$$typeof === Symbol.for(type)
	)
}

/**
 * `memo()` and `forwardRef()` components are objects, not functions.
 *
 * @param {unknown} value
 */
function isComponent(value) {
	return (
		typeof value === 'function' ||
		isType(value, 'react.memo') ||
		isType(value, 'react.forward_ref')
	)
}
