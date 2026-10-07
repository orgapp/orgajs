import { renderToString } from 'react-dom/server'
import endpoints from '/@orga-build/endpoints'
import pages from '/@orga-build/pages'
import { App } from './app.jsx'
import { beginPage } from './island.jsx'

export { pages }
export { endpoints }

/**
 * Render the page at `url` to static HTML.
 *
 * @param {string} url
 * @param {(src: string) => string} resolveIslandUrl - Maps an island's source
 *   path (relative to the Vite root) to the URL the browser imports it from
 */
export function render(url, resolveIslandUrl) {
	if (!pages[url]) return
	beginPage(resolveIslandUrl)
	return renderToString(<App path={url} />)
}
