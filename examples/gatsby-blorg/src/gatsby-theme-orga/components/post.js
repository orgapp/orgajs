import React from 'react'
import Layout from '../../components/layout'

export default ({ title, body }) => {
  return (
    <Layout>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </Layout>
  )
}
