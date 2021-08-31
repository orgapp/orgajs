import React from 'react'
import { Grid } from 'theme-ui'
import PostLink from './post-link'

const PostList = ({ posts, columns = 1 }) => {
  return (
    <Grid columns={[1, columns]}>
      {posts.map((node, i) => (
        <PostLink key={`${node.id}-${i}`} {...node} />
      ))}
    </Grid>
  )
}

export default PostList
