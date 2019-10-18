import React from 'react'
import Layout from '../../components/layout'

export default ({ title, slug, body }) => {
  return (
    <Layout>
      <pre>{ slug }</pre>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </Layout>
  )
}
