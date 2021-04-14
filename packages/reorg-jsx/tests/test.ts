import reorg from '@orgajs/reorg'
import jsx from '../src'
import vfile from 'to-vfile'
import path from 'path'
import { parse } from '@typescript-eslint/typescript-estree'
import { inspect } from 'util'

test('basic org-mode parsing', async () => {

  const processor = reorg()
    .use(jsx)

  const input = vfile.readSync(path.resolve(__dirname, 'example.org'), 'utf8')

  const result = await processor.process(input)

  console.dir(result.contents)
})

test.skip('poc', async () => {
  const code = `
import { Button } from 'theme-ui'

const View = () => {
return (
<Button/>
)
}

export default View
`

  const tree = parse(code, { jsx: true })

  console.log(inspect(tree, false, null, true))
})
