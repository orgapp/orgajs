import React from 'react'
import Layout from '../../components/layout'

export default ({ post }) => {
  const { title } = post.metadata
  return (
    <Layout>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  )
}
