import pages from '@orga-build/pages'
import { renderToString } from 'react-dom/server'
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
	const Content = page.default
	const components = {Notice}
	return renderToString(<Content title={page.title} components={components}/>);
}

function Notice({children}) {
	return (
		<div>
			<h1>Notice</h1>
			<p>{children}</p>
		</div>
	)
}
