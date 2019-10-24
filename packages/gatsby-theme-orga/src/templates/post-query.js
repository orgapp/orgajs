import { graphql } from 'gatsby'
import PostPage from '../components/post'

const mapProps = Component => ({ data, pageContext: { metadata } }) =>
      Component({
        ...metadata,
        body: data.orgContent.html,
        slug: data.orgContent.fields.slug,
        siteMetadata: data.site.siteMetadata,
      })

export default mapProps(PostPage)

export const pageQuery = graphql`
query PostById($id: String!) {
  site {
    siteMetadata {
      title
    }
  }
  orgContent(id: { eq: $id }) {
    html
    fields { slug }
  }
}
`
