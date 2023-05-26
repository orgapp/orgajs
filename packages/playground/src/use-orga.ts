import * as reactRuntime from 'react/jsx-runtime.js'
import { useState, useEffect, useCallback } from 'react'
import { VFile } from 'vfile'
import { VFileMessage } from 'vfile-message'
import { tokenize } from 'orga'
import { evaluate, EvaluateOptions } from '@orgajs/orgx'
import latex from '@orgajs/rehype-latex'

interface Output extends VFile {
  result: React.FC
}

export function useOrga(
  input: string,
  runtime: EvaluateOptions = reactRuntime as EvaluateOptions
): { output: Output } {
  const [output, setOutput] = useState<Output>(null)

  const setInput = useCallback(async (input: string) => {
    const file = new VFile(input)

    const capture = (name: string) => () => (tree) => {
      file.data[name] = tree
    }

    try {
      capture('tokens')()(tokenize(input).all())

      file.result = (
        await evaluate(file, {
          ...runtime,
          // reorgPlugins: [capture('oast')],
          rehypePlugins: [latex, capture('rehype')],
          recmaPlugins: [capture('estree')],
        })
      ).default
      capture('jsx')()(String(file))
    } catch (error) {
      const message = new VFileMessage(error)

      if (!file.messages.includes(message)) {
        file.messages.push(message)
      }

      message.fatal = true
    }

    setOutput(file as Output)
  }, [])

  useEffect(() => {
    setInput(input)
  }, [input, setInput])

  return {
    output,
  }
}

export default useOrga
