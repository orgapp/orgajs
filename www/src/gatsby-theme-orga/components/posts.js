import React from 'react'
import styled from 'styled-components'
import Layout from '../../components/layout'
import { StyledLink } from '../../components/styled'

const Desc = styled.p`
color: gray;
`

const Keyword = styled.small`
color: gray;
`

const Title = styled.h3`
margin-top: 0.2em;
`

const DocLink = ({ metadata: { title, description, date, keyword }, fields: { slug } }) => (
  <StyledLink to={slug} key={`doc-link-${slug}`}>
    <Keyword>{ keyword }</Keyword>
    <Title>{ title }</Title>
    <small>{ `${new Date(date)}` }</small>
    <Desc>{ description }</Desc>
  </StyledLink>
)

export default ({ posts }) => (
  <Layout>
    <div>{ posts.map(DocLink) }</div>
  </Layout>
)
