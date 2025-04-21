import pages from '@orga-build/pages'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { App } from './app.jsx'
export {pages}

/**
 * @param {string} url
 */
export function render(url) {
	const page = pages[url]
	if (!page) {
		console.log(`no page found for ${url}`)
		return
	}
	return renderToString(<SSRContent url={url}/>);
}

function SSRContent({url}) {
	return (
		<StaticRouter location={url}>
			<App />
		</StaticRouter>
	)
}

