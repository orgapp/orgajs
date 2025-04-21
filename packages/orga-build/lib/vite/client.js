import { hydrateRoot } from 'react-dom/client'
import pages from '@orga-build/pages'
import { createElement } from 'react'

const ssr = window._ssr

hydrate()

function hydrate() {
	const container = document.getElementById('root')
	const page = pages[ssr.routePath]
	hydrateRoot(container, createElement(page.default))
}
