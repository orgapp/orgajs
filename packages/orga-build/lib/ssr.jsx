import pages from '@orga-build/pages'
import { renderToString } from 'react-dom/server'
import { App } from './app.jsx'
import { Router } from 'wouter'

export { pages }

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
