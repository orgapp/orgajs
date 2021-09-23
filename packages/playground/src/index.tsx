import React, { FC, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { ErrorBoundary } from 'react-error-boundary'
import JSONTree from 'react-json-tree'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import vfileMessage from 'vfile-message'
import { tokenizer } from './org-syntax'
import codeTheme from './theme/light'
import { useOrga } from './use-orga'

const theme = {
  background: '#f5f8fa',
  surface: '#ffffff',
  border: '#e0e4e8',
  primary: '#ff7a64',
  text: '#23292f',
  lightText: '#68737e',
  code: 'github-light',
}

const treeTheme = {
  scheme: 'monokai',
  // base00: '#272822',
  base00: 'black',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
}

interface Props {
  runtime?: unknown
  children: string
  onChange?: (text: string) => void
  style?: React.CSSProperties
}

const Playground: FC<Props> = ({ runtime, onChange, style = {}, children }) => {
  const text = `${children}`

  const monaco = useMonaco()
  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'org-mode' })
      monaco.languages.setMonarchTokensProvider('org-mode', {
        tokenizer,
      })
    }
  }, [monaco])

  const beforeEditorMount = (monaco) => {
    monaco.editor.defineTheme('github-light', codeTheme)
  }

  const { output } = useOrga(text, runtime)

  return (
    <div
      style={{
        display: 'flex',
        color: theme.text,
        minHeight: '540px',
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        width: '100vw',
        height: '100%',
        ...style,
      }}
    >
      <div
        style={{
          gridArea: 'input',
          width: '50%',
          borderRight: `1px solid ${theme.border}`,
        }}
      >
        <Editor
          value={text}
          onChange={onChange}
          theme={theme.code}
          language="org-mode"
          path="text.org"
          beforeMount={beforeEditorMount}
          options={{
            minimap: {
              enabled: false,
            },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gridArea: 'output',
          backgroundColor: theme.surface,
          height: '100%',
          width: '50%',
        }}
      >
        <Tabs style={{ flex: 1, width: '100%' }} defaultIndex={5}>
          <TabList>
            <Tab style={{ color: theme.lightText }}>tokens</Tab>
            <Tab style={{ color: theme.lightText }}>oast</Tab>
            <Tab style={{ color: theme.lightText }}>rehype</Tab>
            <Tab style={{ color: theme.lightText }}>estree</Tab>
            <Tab style={{ color: theme.lightText }}>jsx</Tab>
            <Tab style={{ color: theme.lightText }}>preview</Tab>
          </TabList>
          <TabPanel style={{ padding: '0.4em 0.8em' }}>
            {output ? (
              <JSONTree
                data={output.data['tokens'] || []}
                theme={treeTheme}
                invertTheme={true}
                getItemString={(type, data) => <span>{data.type}</span>}
              />
            ) : null}
          </TabPanel>
          <TabPanel style={{ padding: '0.4em 0.8em' }}>
            {output ? (
              <JSONTree
                data={output.data['oast']}
                theme={treeTheme}
                invertTheme={true}
                getItemString={(type, data, itemType, itemString) =>
                  type === 'Object' ? (
                    <span>{data.type}</span>
                  ) : (
                    <span>
                      {itemType} {itemString}
                    </span>
                  )
                }
              />
            ) : null}
          </TabPanel>
          <TabPanel style={{ padding: '0.4em 0.8em' }}>
            {output ? (
              <JSONTree
                data={output.data['rehype']}
                theme={treeTheme}
                invertTheme={true}
              />
            ) : null}
          </TabPanel>
          <TabPanel style={{ padding: '0.4em 0.8em' }}>
            {output ? (
              <JSONTree
                data={output.data['estree']}
                theme={treeTheme}
                invertTheme={true}
              />
            ) : null}
          </TabPanel>
          <TabPanel style={{ height: '100%' }}>
            {output ? (
              <Editor
                value={output.data['jsx']}
                theme={theme.code}
                language="javascript"
                path="text.jsx"
                options={{
                  minimap: {
                    enabled: false,
                  },
                  readOnly: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                }}
              />
            ) : null}
          </TabPanel>
          <TabPanel style={{ padding: '0.4em 0.8em' }}>
            <div style={{ overflow: 'scroll' }}>
              {output && output.result ? (
                <ErrorBoundary FallbackComponent={FallbackComponent}>
                  <output.result />
                </ErrorBoundary>
              ) : null}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  )
}

const FallbackComponent: FC<{ error: Error }> = ({ error }) => {
  const message = vfileMessage(error)
  message.fatal = true
  return (
    <pre>
      <code>{String(message)}</code>
    </pre>
  )
}

export default Playground
