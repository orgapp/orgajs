import pages from '/@orga-build/pages'
import layouts from '/@orga-build/layouts'
import * as components from '/@orga-build/components'
import { Route, Switch, Link } from 'wouter'

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
		let element = <page.default components={{ ...components, Link, a: Link }} />
		for (const layoutId of layoutIds) {
			const Layout = layouts[layoutId]
			element = (
				<Layout title={page.title} slug={path} pages={_pages} {...page}>
					{element}
				</Layout>
			)
		}
		return {
			path,
			element
		}
	})

	return (
		<Switch>
			{pageRoutes.map((route) => {
				return (
					<Route key={`r-${route.path}`} path={route.path}>
						{route.element}
					</Route>
				)
			})}
		</Switch>
	)
}
