import React from 'react'
import Layout from '../../components/layout'
import { Link } from 'gatsby'
import { List } from 'semantic-ui-react'

const DocLink = ({ metadata: { title, description, date, keyword }, fields: { slug } }) => (
  <List.Item as={Link} to={slug} key={`doc-link-${slug}`}>
    <List.Content>
      <List.Header>{ title }</List.Header>
      <List.Description>{ description }</List.Description>
    </List.Content>
  </List.Item>
)

export default ({ posts }) => (
  <Layout>
    <List divided relaxed>
      { posts.map(DocLink) }
    </List>
  </Layout>
)
