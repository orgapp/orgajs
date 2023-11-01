import { evaluate, type OrgContent } from '@orgajs/orgx'
import { unified } from 'unified'
import reorgParse from '@orgajs/reorg-parse'
import { tokenize } from 'orga'
import reorgRehype from '@orgajs/reorg-rehype'
import rehypeStringify from 'rehype-stringify'
import { useEffect, useState } from 'react'
import * as runtime from 'react/jsx-runtime'
import { VFile } from 'vfile'
import { debounce } from './debounce'
import { removePosition } from 'unist-util-remove-position'

interface OrgState {
  file: VFile | null
  Content: OrgContent | null
}

export function useOrg({ value }: { value: string }) {
  const [state, setState] = useState<OrgState>({ file: null })
  const filename = 'example.org'

  useEffect(() => {
    setValue(value)
  }, [value])

  async function setValue(content: string) {
    const file = new VFile({ path: filename, value: content })

    const capture = (name: string) => () => (tree) => {
      file.data[name] = structuredClone(tree)
    }
    const tokens = tokenize(file.toString())
      .all()
      .map((t) => {
        delete t.position
        return t
      })
    capture('tokens')()(tokens)

    const Content = (
      await evaluate(file, {
        ...runtime,
        reorgPlugins: [capture('oast')],
        rehypePlugins: [capture('hast')],
      })
    ).default
    removePosition(file.data.oast, { force: true })
    removePosition(file.data.hast, { force: true })
    setState({ file, Content })
  }
  return { state, setValue: debounce(setValue, 300) }
}

export async function parse(value: string) {
  const filename = 'example.org'
  const file = new VFile({ path: filename, value })
  const capture = (name: string) => () => (tree) => {
    file.data[name] = structuredClone(tree)
  }

  const processor = unified()
    .use(reorgParse)
    .use(capture('oast'))
    .use(reorgRehype)
    .use(capture('hast'))
    .use(rehypeStringify)

  return await processor.process(file)
}
