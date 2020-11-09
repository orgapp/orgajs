import { graphql } from 'gatsby'
import PostPage from '../components/post'

export default PostPage

export const pageQuery = graphql`
query PostById($id: String!) {
  orgContent(id: { eq: $id }) {
    title
    category
    excerpt
    date(formatString: "MMMM DD, YYYY")
    tags
    html
    fields { slug }
  }
}
`
