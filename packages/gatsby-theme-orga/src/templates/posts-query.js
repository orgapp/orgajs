import PostsPage from '../components/posts'

const mapProps = Component => ({ data, pageContext, ...props }) =>
      Component({
        posts: pageContext.posts.map(p => ({ ...p.metadata, ...p.fields })),
        prev: pageContext.prev,
        next: pageContext.next,
        ...props,
      })

export default mapProps(PostsPage)

