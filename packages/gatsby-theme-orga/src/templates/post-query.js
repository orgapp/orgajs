import { graphql } from 'gatsby'
import PostPage from '../components/post'

export default PostPage

export const pageQuery = graphql`
query PostById($id: String!) {
  orgPost(id: { eq: $id }) {
    title
    category
    excerpt
    date(formatString: "MMMM DD, YYYY")
    tags
    html
    slug
  }
}
`
