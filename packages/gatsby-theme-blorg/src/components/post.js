import React from 'react'
import Layout from './layout'
import { inspect } from 'util'
const print = o => {
  return inspect(o, false, null, false)
}

export default props => {
  const { title, date, body, siteMetadata } = props
  return (
    <Layout title={ siteMetadata.title }>
      <h1>{ title }</h1>
      <h5>props</h5>
      <pre>{ print(props) }</pre>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </Layout>
  )
}
