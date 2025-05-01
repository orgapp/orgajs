import { createElement } from 'react'
import pages from '@orga-build/pages'
import layouts from '@orga-build/layouts'
import * as components from '@orga-build/components'
import { Link, useRoutes } from 'react-router'

export function App() {
	const _pages = Object.entries(pages).map(([path, page]) => {
		return {
			slug: path,
			...page
		}
	})

	const pageRoutes = Object.entries(pages).map(([path, page]) => {
		const layoutIds = Object.keys(layouts)
			.filter((key) => path.startsWith(key))
			.sort((a, b) => -a.localeCompare(b))
		let element = createElement(page.default, {
			components: { ...components, Link }
		})
		for (const layoutId of layoutIds) {
			element = createElement(
				layouts[layoutId],
				{
					title: page.title,
					slug: path,
					...page,
					pages: _pages
				},
				element
			)
		}
		return {
			path,
			element
		}
	})

	return useRoutes(pageRoutes)
}
