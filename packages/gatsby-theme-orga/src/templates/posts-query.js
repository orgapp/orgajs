import PostsPage from '../components/posts'
import { graphql } from 'gatsby'

export default PostsPage

export const query = graphql`
  query PostsQuery($ids: [String!]!) {
    site {
      siteMetadata {
        title
      }
    }
    allOrgContent(
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
        fields { slug }
      }
    }
  }
`
