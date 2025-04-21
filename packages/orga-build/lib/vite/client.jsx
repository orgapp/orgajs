import { hydrateRoot } from 'react-dom/client'
import pages from '@orga-build/pages'
import { BrowserRouter, useRoutes } from 'react-router'
import { App } from './app.jsx'

const ssr = window._ssr

hydrate()

function hydrate() {
	const container = document.getElementById('root')
	// const page = pages[ssr.routePath]
	hydrateRoot(
		container,
		<BrowserRouter basename='/'>
			<App />
		</BrowserRouter>
	)
}
