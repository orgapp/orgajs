import test from 'node:test'
import assert from 'node:assert'
import { promises as fs } from 'fs'
import { rollup } from 'rollup'
import { fileURLToPath } from 'url'
import rollupOrg from './index.js'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

test('@orgajs/rollup', async () => {
  await fs.writeFile(new URL('rollup.org', import.meta.url), '* Hi')

  const bundle = await rollup({
    input: fileURLToPath(new URL('rollup.org', import.meta.url)),
    external: ['react/jsx-runtime'],
    plugins: [rollupOrg()],
  })

  const { output } = await bundle.generate({ format: 'es', sourcemap: true })

  await fs.writeFile(new URL('rollup.js', import.meta.url), output[0].code)

  /* @ts-expect-error file is dynamically generated */
  // eslint-disable-next-line import/no-unresolved
  const { default: Content } = await import('./rollup.js')

  // t.is(output[0].map ? output[0].map.mappings : undefined, undefined)

  assert.equal(
    renderToStaticMarkup(createElement(Content)),
    '<div class="section"><h1>Hi</h1></div>'
  )

  await fs.unlink(new URL('rollup.org', import.meta.url))
  await fs.unlink(new URL('rollup.js', import.meta.url))
})
