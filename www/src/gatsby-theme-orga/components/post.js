import React from 'react'
import Layout from '../../components/layout'

export default ({ body, pageContext: metadata }) => {
  const { title } = metadata
  return (
    <Layout>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </Layout>
  )
}
