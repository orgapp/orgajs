import { Link } from 'gatsby'
import React from 'react'
import { List } from 'semantic-ui-react'
import Layout from '../../components/layout'

const DocLink = ({ title, description, date, keyword, slug }) => (
  <List.Item as={Link} to={slug} key={`doc-link-${slug}`}>
    <List.Content>
      <List.Header>{ title }</List.Header>
      <List.Description>{ description }</List.Description>
    </List.Content>
  </List.Item>
)

export default ({ data }) => (
  <Layout>
    <List divided relaxed>
      { data.allOrgPost.nodes.map(DocLink) }
    </List>
  </Layout>
)
