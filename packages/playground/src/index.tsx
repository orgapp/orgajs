import React, { useEffect } from 'react';
import { LivePreview, LiveProvider, LiveError } from 'react-live';
import reorg from '@orgajs/reorg'
import toRehype from '@orgajs/reorg-rehype'
import toEstree from '@orgajs/rehype-estree'
import toJsx from '@orgajs/estree-jsx'
import { OrgaProvider, orga } from '@orgajs/react'
import Tabs from './tabs'
import JSONTree from 'react-json-tree'
import Editor, { useMonaco } from '@monaco-editor/react'
import { tokenizer } from './org-syntax'


const theme = {
  background: '#f5f8fa',
  surface: '#ffffff',
  border: '#e0e4e8',
  primary: '#ff7a64',
  text: '#23292f',
  lightText: '#68737e',
  code: 'vs-light',
}

const treeTheme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
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

const Playground = ({ code, onChange, style }) => {

  const monaco = useMonaco()
  useEffect(() => {
    if (monaco) {
      monaco.languages.register({ id: 'org-mode' })
      monaco.languages.setMonarchTokensProvider('org-mode', {
        tokenizer,
      })
    }
  }, [monaco])

  function getOutputs(src: string) {
    const result = {
      oast: undefined,
      rehype: undefined,
      estree: undefined,
      jsx: '',
    }

    const saveTo = (path: string) => {
      return () => tree => {
        result[path] = tree
        return tree
      }
    }

    try {
      const processor = reorg()
            .use(saveTo('oast'))
            .use(toRehype)
            .use(saveTo('rehype'))
            .use(toEstree, { skipExport: true, skipImport: true })
            .use(saveTo('estree'))
            .use(toJsx, { renderer: '' })

      const code = processor.processSync(src)
      result.jsx = String(code)
    } catch (err) {

    }

    return result
  }

  const { oast, rehype, estree, jsx } = getOutputs(code)

  function compile(text: string) {
    let jsx = ''
    try {
      const processor = reorg()
            .use(toRehype)
            .use(toEstree, { skipExport: true, skipImport: true })
            .use(toJsx, { renderer: '' })

      const code = processor.processSync(text)

      jsx = `
    ${code}

    render(
      <OrgaProvider components={components}>
        <MDXContent {...props} />
      </OrgaProvider>
    )
  `
    } catch (err) {
      jsx = ''
    }
    return jsx
  }

  const components = {}
  const props = {}

  const Panel = ({label, children}) => <div style={{
    height: '100%',
  }} label={label}>{children}</div>

  return (
    <LiveProvider
      code={code}
      scope={{
        OrgaProvider,
        orga,
        components,
        props,
      }}
      noInline={true}
      transformCode={(code) => compile(code)}>
      <div style={{
        display: 'flex',
        color: theme.text,
        minHeight: '540px',
        backgroundColor: theme.background,
        border: `1px solid ${theme.border}`,
        height: '100%',
        ...style,
      }}>
        <div style={{ gridArea: 'input', width: '50%', borderRight: `1px solid ${theme.border}` }}>
          <Editor
            value={code}
            onChange={(value) => onChange(value)}
            theme={theme.code}
            language='org-mode'
            path='text.org'
            options={{
              minimap: {
                enabled: false,
              },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <Tabs style={{
          gridArea: 'output',
          backgroundColor: theme.surface,
          height: '100%',
          width: '50%',
        }} theme={theme} defaultTab='preview'>
          <Panel label='oast'>
            <JSONTree data={oast} theme={treeTheme} invertTheme={true}/>
          </Panel>
          <Panel label='rehype'>
            <JSONTree data={rehype} theme={treeTheme} invertTheme={true}/>
          </Panel>
          <Panel label='estree'>
            <JSONTree data={estree} theme={treeTheme} invertTheme={true}/>
          </Panel>
          <Panel label='jsx'>
            <Editor
              value={jsx}
              theme={theme.code}
              language='javascript'
              path='text.jsx'
              options={{
                readOnly: true,
                scrollBeyondLastLine: false,
              }}
            />
          </Panel>
          <LivePreview label='preview'/>
        </Tabs>
        <LiveError/>
      </div>
    </LiveProvider>
  )
}

export default Playground
