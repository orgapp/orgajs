import React, { useState, useEffect } from 'react'
import Layout from '../components/layout'
import queryString from 'query-string'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import styled from 'styled-components'
import { parse } from 'orga'
import toHAST from 'oast-to-hast'
import stringify from 'hast-util-to-html'
import toHAST from 'oast-to-hast'
import { parse } from 'orga'
import React, { useState } from 'react'
import JSONTree from 'react-json-tree'
import styled from 'styled-components'
import Layout from '../components/layout'
import {
  Segment,
  Grid,
  Divider,
  Button,
  Icon,
  TextArea,
} from 'semantic-ui-react'
======= end

const INPUT_HEIGHT = `350px`

const Preview = styled.div`
max-height: ${INPUT_HEIGHT};
overflow: auto;
`

const Input = styled(TextArea)`
width: 100%;
height: 100%;
border: none;
outline: none;
background-color: #071404;
color: #6cf04c;
padding: 1em;
border-radius: .5em;
overflow: auto;
height: ${INPUT_HEIGHT};
::selection {
  color: #d8ffcc;
  background-color: #43a823;
}
`

const decode = decodeURIComponent
const encode = encodeURIComponent

export default ({ location }) => {
  const q = queryString.parse(location.search)

  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const oast = parse(text)
  const hast = toHAST(oast)
  const html = stringify(hast, { allowDangerousHtml: true })

  const onTextChange = e => {
    setText(`${e.target.value}`)
    setCopied(false)
  }

  useEffect(() => {
    setText(decode(q.text || ''))
  }, [q.text])

  return (
    <Layout>
      <Segment raised>
        <Grid columns={2} stackable padded>
          <Grid.Row>
            <Grid.Column>
              <p style={{ color: 'gray' }}>
                { copied ? 'link copied to your clipboard' : '' }
              </p>
            </Grid.Column>
            <Grid.Column>
              <Button.Group floated='right'>
                <CopyToClipboard
                  text={`${location.origin}?text=${encode(text)}`}
                  onCopy={() => setCopied(true)}>
                  <Button content='Permalink' icon='linkify' labelPosition='left'/>
                </CopyToClipboard>
              </Button.Group>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row verticalAlign='top'>
            <Divider vertical>
              <Icon name='angle right'/>
            </Divider>
            <Grid.Column>
              <Input
                rows="10"
                value={text}
                onChange={onTextChange}/>
            </Grid.Column>
            <Grid.Column>
              <Preview dangerouslySetInnerHTML={{ __html: html }} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
      <h1>OAST</h1>
      <p>Org Abstract Syntax Tree</p>
      <JSONTree data={oast}/>
    </Layout>
  )
}
