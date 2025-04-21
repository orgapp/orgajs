import { createElement } from 'react'
import pages from '@orga-build/pages'
import * as components from '@orga-build/components'
import { Link, useRoutes } from 'react-router'

export function App() {
	const pageRoutes = Object.entries(pages).map(([path, page]) => (
		{
			path,
			element: createElement(page.default, {components: {...components, Link}}),
		}
	))

	return useRoutes(pageRoutes)
}

function Notice({children}) {
	return (
		<div>
			<h1>Notice</h1>
			<p>{children}</p>
		</div>
	)
}
