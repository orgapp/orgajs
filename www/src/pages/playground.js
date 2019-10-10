import React, { useState } from 'react'
import Layout from '../components/layout'
import { parse } from 'orga'
import { inspect } from 'util'


export default () => {
  const [text, setText] = useState('')
  const ast = parse(text)
  console.log(ast)
  const tree = inspect(ast, false, null, false)
  console.log(tree)

  return (
    <Layout>
      <textarea cols="30" rows="10" onChange={e => setText(e.target.value)}>
        { text }
      </textarea>
      <pre>
        { tree }
      </pre>
    </Layout>
  )
}
