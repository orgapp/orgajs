import stringify from 'hast-util-to-html'
import toHAST from 'oast-to-hast'
import { parse } from 'orga'
import React, { useState } from 'react'
import JSONTree from 'react-json-tree'
import styled from 'styled-components'
import Layout from '../components/layout'

const Container = styled.div`
display: flex;
`

const Preview = styled.div`
padding: 1em;
`

const Input = styled.textarea`
width: 100%;
height: 100%;
border: none;
outline: none;
background-color: #071404;
color: #6cf04c;
padding: 1em;
border-radius: .5em;
overflow: auto;
::selection {
  color: #d8ffcc;
  background-color: #43a823;
}
`

const Half = styled.div`
width: 50%;
`

export default () => {
  const [text, setText] = useState('')
  const oast = parse(text)
  const hast = toHAST(oast)
  const html = stringify(hast, { allowDangerousHtml: true })

  return (
    <Layout>
      <Container>
        <Half>
          <Input
            rows="10"
            value={text}
            onChange={e => setText(e.target.value)}/>
        </Half>
        <Half>
          <Preview dangerouslySetInnerHTML={{ __html: html }} />
        </Half>
      </Container>
      <h1>OAST</h1>
      <p>Org Abstract Syntax Tree</p>
      <JSONTree data={oast}/>
    </Layout>
  )
}
