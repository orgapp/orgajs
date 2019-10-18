import React from 'react'
import Layout from '../../components/layout'

export default ({ pageContext: { post } }) => {
  return (
    <Layout>
      <h1>{ post.metadata.title }</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  )
}
