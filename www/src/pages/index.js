import React, { useState } from 'react'
import Layout from '../components/layout'
import styled from 'styled-components'
import { parse } from 'orga'
import { inspect } from 'util'
import toHAST from 'oast-to-hast'
import stringify from 'hast-util-to-html'

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
background-color: #eee8d5;
padding: 1em;
border-radius: .5em;
`

const Half = styled.div`
width: 50%;
`

const print = ast => {
  return inspect(ast, false, null, false)
}

export default () => {
  const [text, setText] = useState('')
  const oast = parse(text)
  const hast = toHAST(oast)
  const html = stringify(hast)

  return (
    <Layout>
      <Container>
        <Half>
          <Input rows="10" onChange={e => setText(e.target.value)}>
            { text }
          </Input>
        </Half>
        <Half>
          <Preview dangerouslySetInnerHTML={{ __html: html }} />
        </Half>
      </Container>
      <h1>OAST</h1>
      <p>Org Abstract Syntax Tree</p>
      <pre>
        { print(oast) }
      </pre>
    </Layout>
  )
}
