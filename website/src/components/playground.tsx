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
    <Magic tabs={tabs}>
      <OrgEditor
        className="h-full w-full not-prose"
        onChange={onChange}
        content={content}
      />
    </Magic>
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
