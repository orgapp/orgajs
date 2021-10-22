import * as reactRuntime from 'react/jsx-runtime.js'
import { useState, useEffect, useCallback } from 'react'
import vfile, { VFile } from 'vfile'
import VMessage from 'vfile-message'
import { tokenize } from 'orga'
import { evaluate, RuntimeOptions } from '@orgajs/orgx'
import latex from '@orgajs/rehype-latex'

interface Output extends VFile {
  result?: React.FC
}

export function useOrga(
  input: string,
  runtime: RuntimeOptions = reactRuntime as RuntimeOptions
): { output: Output } {
  const [output, setOutput] = useState<Output>(null)

  const setInput = useCallback(async (input: string) => {
    const file = vfile(input)

    const capture = (name: string) => () => (tree) => {
      file.data[name] = tree
    }

    try {
      capture('tokens')()(tokenize(input).all())

      file.result = (
        await evaluate(file, {
          ...runtime,
          reorgPlugins: [capture('oast')],
          rehypePlugins: [latex, capture('rehype')],
          estreePlugins: [capture('estree')],
        })
      ).default
      capture('jsx')()(String(file))
    } catch (error) {
      const message = new VMessage(error)

      if (!file.messages.includes(message)) {
        file.messages.push(message)
      }

      message.fatal = true
    }

    setOutput(file)
  }, [])

  useEffect(() => {
    setInput(input)
  }, [input, setInput])

  return {
    output,
  }
}

export default useOrga
