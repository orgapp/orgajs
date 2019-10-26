import React from 'react'
import Layout from './layout'

export default ({ title, body, location }) => {
  return (
    <Layout location={location}>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </Layout>
  )
}
