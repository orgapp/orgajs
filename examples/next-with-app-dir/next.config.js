import rehypePrettyCode from 'rehype-pretty-code'
import orga from '@orgajs/next'
import { visit } from 'unist-util-visit'

function addProps() {
	return (tree) => {
		const newtree = visit(tree, 'element', (node) => {
			if (!node.properties) {
				node.properties = {}
			}
			return node
		})

		console.log(newtree)
		return newtree
	}
}

const withOrga = orga({
	rehypePlugins: [
		addProps,
		[rehypePrettyCode, { theme: 'one-dark-pro', keepBackground: true }],
	],
})

export default withOrga({
	pageExtensions: ['js', 'jsx', 'tsx', 'org'],
	experimental: {
		appDir: true,
	},
	reactStrictMode: true,
})
