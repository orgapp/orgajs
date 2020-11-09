/** @jsx jsx */
import { Styled, jsx } from "theme-ui"

const PostDate = ({ children, ...props }) => (
  <small {...props}>{ children }</small>
)

export default PostDate
