import React, { useState } from 'react';
import { LivePreview, LiveProvider } from 'react-live';
import reorg from '@orgajs/reorg'
import rehype from '@orgajs/reorg-rehype'
import estree from '@orgajs/rehype-estree'
import jsx from '@orgajs/estree-jsx'


const playground = () => {

  const [code, setCode] = useState('<h1>Hello World</h1>')
  const [js, setJs] = useState('')

  function compile(text) {
    const processor = reorg()
          .use(rehype)
          .use(estree)
          .use(jsx)

    const code = processor.processSync(text)
    const js = String(code)
    setJs(js)
    return js
  }

  // const code = compile(text)

  return (
    <LiveProvider code={code} transformCode={(code) => compile(code)}>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        minHeight: '540px',
      }}>
        <textarea style={{
          width: '50%',
          margin: '1em',
          padding: '1em',
          backgroundColor: 'black',
          color: '#80ff7e',
          borderRadius: '0.5em',
        }} value={code} onChange={e => setCode(e.target.value)}/>
        <LivePreview/>
      </div>
      <pre>{js}</pre>
    </LiveProvider>
  )
}

export default playground
