import { EditorState } from '@codemirror/state'
import { useCallback } from 'react'
import { common, createLowlight } from 'lowlight'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { useOrg } from '../utils/org'
import OrgEditor from './editor'
import Magic from './magic'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'

const lowlight = createLowlight(common)

function Code({ lang, children }: { lang: string; children: string }) {
  return (
    <pre className="hljs language-js">
      <code>
        {toJsxRuntime(lowlight.highlight(lang, children), {
          Fragment,
          jsx,
          jsxs,
        })}
      </code>
    </pre>
  )
}

export default function Playground({ content }: { content: string }) {
  const { state, setValue } = useOrg({ value: content })

  const onChange = useCallback(
    (v: EditorState) => {
      const newDoc = v.doc.toString()
      setValue(newDoc)
    },
    [setValue]
  )

  function copyToClipboard() {
    const content = encodeURIComponent(state.original)
    const host = window.location.host
    const link = `${host}/playground?text=${content}`
    navigator.clipboard.writeText(link)
  }

  const tabs = [
    {
      tab: 'render',
      view: (
        <div className="prose mx-auto">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {state.Content && <state.Content />}
          </ErrorBoundary>
        </div>
      ),
    },
    {
      tab: 'js',
      view: <Code lang="js">{String(state.file)}</Code>,
    },
    {
      tab: 'tokens',
      view: (
        <Code lang="json">
          {JSON.stringify(state.file?.data['tokens'], null, 2)}
        </Code>
      ),
    },
    {
      tab: 'oast',
      view: (
        <Code lang="json">
          {JSON.stringify(state.file?.data['oast'], null, 2)}
        </Code>
      ),
    },
    {
      tab: 'hast',
      view: (
        <Code lang="json">
          {JSON.stringify(state.file?.data['hast'], null, 2)}
        </Code>
      ),
    },
  ]

  return (
    <div className="h-full w-full">
      <Magic tabs={tabs}>
        <OrgEditor
          className="h-full w-full not-prose"
          onChange={onChange}
          content={content}
        />
      </Magic>
      <button
        className="fixed right-2 bottom-2 text-white bg-blue-600 p-2 px-4 rounded hover:bg-blue-500 border border-blue-600"
        onClick={copyToClipboard}
      >
        generate link
      </button>
    </div>
  )
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button type="button" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  )
}
