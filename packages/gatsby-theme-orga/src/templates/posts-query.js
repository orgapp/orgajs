import { graphql } from "gatsby"
import PostsPage from "../components/posts"

export default PostsPage

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
