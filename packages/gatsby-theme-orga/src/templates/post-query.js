import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data, pageContext: { metadata }, ...props }) =>
      Component({
        ...metadata,
        body: data.orgContent.html,
        slug: data.orgContent.fields.slug,
        siteMetadata: data.site.siteMetadata,
        ...props,
      })

export default mapProps(PostPage)

export const pageQuery = graphql`
query PostById($id: String!) {
  site {
    siteMetadata {
      title
      author
    }
  }
  orgContent(id: { eq: $id }) {
    html
    fields { slug }
  }
}
`
