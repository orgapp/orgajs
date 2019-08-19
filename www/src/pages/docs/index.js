import React from 'react'
import styled from 'styled-components'
import Layout from '../../components/layout'
import { StyledLink } from '../../components/styled'
import { graphql } from 'gatsby'

const Desc = styled.p`
color: gray;
`

const DocLink = ({ node: { meta: { title, description, date }, fields: { slug } } }) => (
  <StyledLink to={slug} key={`doc-link-${slug}`}>
    <h3>{ title }</h3>
    <small>{ `${new Date(date)}` }</small>
    <Desc>{ description }</Desc>
  </StyledLink>
)

export default ({ data }) => (
  <Layout>
    <div>{ data.allOrgContent.edges.map(DocLink) }</div>
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
            description
            date
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
