import React from 'react'
import styled from 'styled-components'
import Layout from '../../components/layout'
import { StyledLink } from '../../components/styled'
import { graphql } from 'gatsby'

const Desc = styled.p`
color: gray;
`

const Keyword = styled.small`
color: gray;
`

const Title = styled.h3`
margin-top: 0.2em;
`

const DocLink = ({ node: { meta: { title, description, keyword }, fields: { slug } } }) => (
  <StyledLink to={slug} key={`roadmap-link-${slug}`}>
    <Keyword>{ keyword }</Keyword>
    <Title>{ title }</Title>
    <Desc>{ description }</Desc>
  </StyledLink>
)

export default ({ data }) => (
  <Layout>
    <div>{ data.allOrgContent.edges.map(DocLink) }</div>
  </Layout>
)

export const pageQuery = graphql`
  query AllRoadmap {
    allOrgContent(
      filter: { meta: { category: { eq: "roadmap" } } }
  ) {
      edges {
        node {
          meta {
            title
            description
            keyword
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
