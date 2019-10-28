import PostsPage from '../components/posts'
import { graphql } from 'gatsby'

const mapProps = Component => ({ data, pageContext, ...props }) =>
      Component({
        posts: pageContext.posts.map(p => ({ ...p.metadata, ...p.fields })),
        prev: pageContext.prev,
        next: pageContext.next,
        siteMetadata: data.site.siteMetadata,
        ...props,
      })

export default mapProps(PostsPage)

export const pageQuery = graphql`
query SiteInfoForPosts {
  site {
    siteMetadata {
      title
      author
    }
  }
}
`
