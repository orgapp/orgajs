import React from 'react'
import Layout from '../components/layout'

export default (props) => {
  const content = props.data.orgContent
  return (
    <Layout>
      <h1>{ content.title }</h1>
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </Layout>
  )
}

export const pageQuery = graphql`
  query OrgaNodeById($orga_id: String!) {
    orgContent(orga_id: { eq: $orga_id }) {
      id
      title
      html
    }
  }
`
