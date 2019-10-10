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
        <Input cols="50" rows="10" onChange={e => setText(e.target.value)}>
          { text }
        </Input>
        <Preview dangerouslySetInnerHTML={{ __html: html }} />
      </Container>
      <h1>OAST</h1>
      <p>Org Abstract Syntax Tree</p>
      <pre>
        { print(oast) }
      </pre>
    </Layout>
  )
}
