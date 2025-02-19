import test from 'node:test'
import assert from 'node:assert'
import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { rollup } from 'rollup'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import rollupOrg from './index.js'

test('@orgajs/rollup', async () => {
	await fs.writeFile(new URL('rollup.org', import.meta.url), '* Hi')

	const bundle = await rollup({
		input: fileURLToPath(new URL('rollup.org', import.meta.url)),
		external: ['react/jsx-runtime'],
		plugins: [rollupOrg()]
	})

	const { output } = await bundle.generate({ format: 'es', sourcemap: true })

	await fs.writeFile(new URL('rollup.js', import.meta.url), output[0].code)

	/* @ts-expect-error file is dynamically generated */

	const { default: Content } = await import('./rollup.js')

	// T.is(output[0].map ? output[0].map.mappings : undefined, undefined)

	assert.equal(
		renderToStaticMarkup(createElement(Content)),
		'<div class="section"><h1>Hi</h1></div>'
	)

	await fs.unlink(new URL('rollup.org', import.meta.url))
	await fs.unlink(new URL('rollup.js', import.meta.url))
})
