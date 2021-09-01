import { existsSync, lstatSync, promises as fs, readdirSync } from 'fs'
import { diff } from 'jest-diff'
import * as path from 'path'
import { parse } from '../index'

const specs = []
// set to true for updating snapshots
// TODO: find a way to use jest cli option -u, if it's possible
// also remove redundant snapshots
const update = false

const readSpec = (dir: string = __dirname) => {
  const files = readdirSync(dir)
  for (const file of files) {
    const abs = path.join(dir, file)
    if (lstatSync(abs).isDirectory()) {
      readSpec(abs)
    } else {
      if (file.endsWith('.org')) {
        const name = path
          .relative(__dirname, abs)
          .split('/')
          .join(' ')
          .replace(/\.org$/, '')

        specs.push({
          name,
          input: abs,
          output: abs.replace(/\.org$/, '.json'),
        })
      }
    }
  }
}

readSpec()

// add this to keep TypeScript happy
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchTree(): Promise<R>
    }
  }
}

expect.extend({
  async toMatchTree({ text, file, tree }) {
    let message = 'should not match tree'
    let pass = false
    const json = JSON.stringify(tree, null, 2)
    const treeFile = file.replace(/\.org$/, '.json')
    let baseline = ''
    let shouldUpdate = update
    if (existsSync(treeFile)) {
      baseline = await fs.readFile(treeFile, { encoding: 'utf8' })
      if (baseline.startsWith('update')) {
        shouldUpdate = true
      }
    } else {
      shouldUpdate = true
    }
    if (shouldUpdate) {
      pass = true
      console.log(` - write tree to ${treeFile}`)
      await fs.writeFile(treeFile, json, 'utf8')
    } else {
      pass = this.equals(baseline.trim(), json.trim())
      if (!pass) {
        message = diff(baseline, json, {
          contextLines: 5,
          expand: false,
        })
      }
    }
    return {
      message: () => message,
      pass,
    }
  },
})

describe('parser', () => {
  test.each(specs)('$name', async ({ input }) => {
    const text = await fs.readFile(input, { encoding: 'utf8' })
    const tree = parse(text, { timezone: 'Pacific/Auckland' })
    await expect({ text, tree, file: input }).toMatchTree()
  })
})
