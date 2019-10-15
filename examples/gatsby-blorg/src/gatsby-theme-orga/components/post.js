import React from 'react'
import Layout from '../../components/layout'

export default ({ post }) => {
  return (
    <Layout>
      <h1>{ post.meta.title }</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </Layout>
  )
}
