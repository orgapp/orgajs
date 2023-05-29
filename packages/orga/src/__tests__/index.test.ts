import { describe, it } from 'node:test'
import assert from 'node:assert'
import { lstatSync, promises as fs, readdirSync } from 'fs'
import * as path from 'path'
import { parse } from '../index.js'

const specs: { name: string; input: string; output: string }[] = []
// set to true for updating snapshots
const update = false
const __dirname = path.dirname(new URL(import.meta.url).pathname)

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

function removeUndefined(obj: any) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key]
    } else if (Array.isArray(obj[key])) {
      for (let i = 0; i < obj[key].length; i++) {
        removeUndefined(obj[key][i])
      }
    } else if (typeof obj[key] === 'object') {
      removeUndefined(obj[key])
    }
  }
  return obj
}

const dateReviver = (key: string, value: any) => {
  if (typeof value === 'string') {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    if (isoDateRegex.test(value)) {
      return new Date(value)
    }
  }
  return value
}

describe('parser', () => {
  specs.forEach(({ name, input, output }) => {
    it(`${name}`, async () => {
      const text = await fs.readFile(input, { encoding: 'utf8' })
      const tree = parse(text, { timezone: 'Pacific/Auckland' })
      if (update) {
        await fs.writeFile(output, JSON.stringify(tree, null, 2), 'utf8')
      } else {
        assert.deepStrictEqual(
          removeUndefined(tree),
          JSON.parse(
            await fs.readFile(output, { encoding: 'utf8' }),
            dateReviver
          )
        )
      }
    })
  })
})
