import { graphql } from "gatsby"
import PostsPage from "../components/posts"
import { get } from 'lodash/fp'

const mapProps = Component => ({ data, pageContext }) =>
      Component({
        posts: data.allOrgContent.edges.map(get('node')),
        prev: pageContext.prev,
        next: pageContext.next,
      })

export default mapProps(PostsPage)

export const query = graphql`
  query notes($ids: [String]!, $skip: Int!, $limit: Int!) {
    allOrgContent(
      filter: { id: { in: $ids } }
      sort: { fields: [meta___date], order: DESC }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          fields {
            slug
          }
          meta { title date }
        }
      }
    }
  }
`
