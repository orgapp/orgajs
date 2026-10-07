import layouts from '/@orga-build/layouts'
import pages from '/@orga-build/pages'

/**
 * The page at `path`, wrapped in every `_layout` above it.
 *
 * @param {{ path: string }} props
 */
export function App({ path }) {
	const page = pages[path]
	const _pages = Object.entries(pages).map(([slug, page]) => ({
		slug,
		...page
	}))

	let element = <page.default />
	const layoutIds = Object.keys(layouts)
		.filter((key) => path.startsWith(key))
		.sort((a, b) => -a.localeCompare(b))
	for (const layoutId of layoutIds) {
		const Layout = layouts[layoutId]
		element = (
			<Layout title={page.title} slug={path} pages={_pages} {...page}>
				{element}
			</Layout>
		)
	}
	return element
}
