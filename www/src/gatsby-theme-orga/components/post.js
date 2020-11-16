import React from 'react'
import Layout from '../../components/layout'

export default ({ data, pageContext: metadata }) => {
  const { title, html } = data.orgPost
  return (
    <Layout>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  )
}
