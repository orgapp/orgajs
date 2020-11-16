import React from "react"
import { Grid } from 'theme-ui'
import PostLink from "./post-link"


const PostList = ({ posts, columns = 1 }) => (
  <Grid columns={[1, columns]}>
    {posts.map((node) => (
      <PostLink key={node.slug} {...node} />
    ))}
  </Grid>
)

export default PostList
