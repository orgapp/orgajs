import { renderToString } from 'react-dom/server'
import { Router } from 'wouter'
import endpoints from '/@orga-build/endpoints'
import pages from '/@orga-build/pages'
import { App } from './app.jsx'

export { pages }
export { endpoints }

/**
 * @param {string} url
 */
export function render(url) {
	const page = pages[url]
	if (!page) {
		console.log(`no page found for ${url}`)
		return
	}
	const ssrContext = {}
	console.log(`rendering ${url}`)
	return renderToString(
		<Router ssrPath={url} ssrContext={ssrContext}>
			<App />
		</Router>
	)
}
