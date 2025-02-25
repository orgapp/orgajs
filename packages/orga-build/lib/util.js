import { exec } from 'node:child_process'
import { createElement } from 'react'

export function buildNav() {}

/**
 * @param {string} file
 * @param {...RegExp|string} patterns
 * @returns {boolean}
 */
export function match(file, ...patterns) {
	return patterns.some((p) => {
		if (p instanceof RegExp) {
			return p.test(file)
		}
		return file === p
	})
}

/**
 * Default layout
 * @param {Object} props
 * @param {string|undefined} props.title
 * @param {import('react').ReactNode} props.children
 * @returns {React.JSX.Element}
 */
export function DefaultLayout({ title, children }) {
	return createElement(
		'html',
		{ lang: 'en' },
		createElement(
			'head',
			{},
			createElement('meta', { charSet: 'utf-8' }),
			createElement('meta', {
				name: 'viewport',
				content: 'width=device-width, initial-scale=1'
			}),
			title && createElement('title', {}, title)
		),
		createElement('body', {}, children)
	)
}

/**
 * @param {string} cmd
 */
export async function $(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			if (stderr) {
				console.error(stderr)
			}
			console.log(stdout)
			resolve(stdout)
		})
	})
}
