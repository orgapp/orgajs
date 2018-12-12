import React from 'react'
import Layout from '../components/layout'
import { graphql } from 'gatsby'

export default (props) => {
  const content = props.data.orgContent
  const { title } = content.meta
  return (
    <Layout>
      <h1>{ title }</h1>
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </Layout>
  )
}

export const pageQuery = graphql`
  query OrgaNodeBySlug($slug: String!) {
    orgContent(fields: { slug: { eq: $slug }}) {
      id
      meta {
        title
      }
      html
    }
  }
`
