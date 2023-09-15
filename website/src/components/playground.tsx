import { EditorState } from '@codemirror/state'
import { useCallback } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useOrg } from '../utils/org'
import OrgEditor from './editor'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { createLowlight, common } from 'lowlight'

const lowlight = createLowlight(common)

function Code({ lang, children }: { lang: string; children: string }) {
  return (
    <pre className="hljs language-js overflow-auto h-full w-full">
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

  return (
    <div className="h-full w-full">
      <Tabs className="h-full w-full grid grid-cols-2 grid-rows-[auto_1fr]">
        <div className="col-span-2 flex justify-between items-center px-2 py-1 border-b border-slate-300 auto-cols-min">
          <a className="px-2 border text-blue-600" href="/">
            HOME
          </a>
          <TabList className="flex justify-end bg-slate-200 border-b border-slate-300 rounded-lg p-0.5">
            {['render', 'js', 'oast (org)', 'hast (HTML)'].map((tab) => (
              <Tab
                key={tab}
                className="px-2 min-w-[50px] border border-slate-200 cursor-pointer overflow-hidden rounded text-center"
                selectedClassName="bg-slate-100 border border-slate-400 shadow"
              >
                {tab}
              </Tab>
            ))}
          </TabList>
        </div>

        <OrgEditor
          className="h-full w-full overflow-auto"
          onChange={onChange}
          content={content}
        />
        <div className="overflow-auto border-l border-slate-200 p-4">
          <TabPanel>
            <div className="h-full w-full prose overflow-auto mx-auto">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                {state.Content && <state.Content />}
              </ErrorBoundary>
            </div>
          </TabPanel>
          <TabPanel>
            <Code lang="js">{String(state.file)}</Code>
          </TabPanel>
          <TabPanel>
            <Code lang="json">
              {JSON.stringify(state.file?.data['oast'], null, 2)}
            </Code>
          </TabPanel>
          <TabPanel>
            <Code lang="json">
              {JSON.stringify(state.file?.data['hast'], null, 2)}
            </Code>
          </TabPanel>
        </div>
      </Tabs>
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
