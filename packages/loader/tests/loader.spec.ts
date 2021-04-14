import reorg2jsx from '@orgajs/reorg-jsx'
import compiler from './_compiler'

test('basic org-mode parsing', async () => {
  const stats = await compiler('example.org', {
    name: 'Alice',
    // plugins: [reorg2rehype, toHtml]
    // plugins: [reorg2rehype, hastToJsx]
    plugins: [reorg2jsx]
  })
  // @ts-ignore
  const output = stats.toJson({ source: true }).modules[0].source
  // const output = stats.

  // console.log(inspect(output, false, null, true))

  console.dir(output)
})
