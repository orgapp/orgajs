import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data }) =>
      Component({ post: data.orgContent })

export default mapProps(PostPage)

// export const pageQuery = graphql`
// query BlogPostBySlug($id: String!) {
//   orgContent(id: { eq: $id }) {
//     html
//     metadata
//     fields { slug }
//   }
// }
// `
