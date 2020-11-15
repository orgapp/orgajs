import { graphql } from 'gatsby'
import PostsPage from '../components/posts'

export default PostsPage

export const query = graphql`
  query PostsQuery($ids: [String!]!) {
    site {
      siteMetadata {
        title
      }
    }
    allOrgPost(
      filter: { id: { in: $ids } }
      sort: { fields: [date, title], order: DESC }
    ) {
      nodes {
        id
        title
        category
        excerpt
        date(formatString: "MMMM DD, YYYY")
        tags
        slug
      }
    }
  }
`
