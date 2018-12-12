import React from 'react'
import util from 'util'
import Layout from '../../components/layout'
import { graphql } from 'gatsby'

const Doc = ({ node: { title } }) => (
  <div key={title}>
    <h2>{ title }</h2>
  </div>
)

const debug = (data) => {
  console.log(util.inspect(data, false, null, true))
  return data
}

export default ({ data }) => (
  <Layout>
    <div>{ data.allOrgContent.edges.map(Doc) }</div>
  </Layout>
)

export const pageQuery = graphql`
  query AllDocs {
    allOrgContent(
      filter: { meta: { category: { eq: "docs" } } }
  ) {
      edges {
        node {
          meta {
            title
          }
          html
        }
      }
    }
  }
`
