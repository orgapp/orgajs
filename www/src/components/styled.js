import { Link } from 'gatsby'
import styled from 'styled-components'
import typography from '../utils/typography'
const { rhythm } = typography

export const StyledLink = styled(Link)`
display: block;
text-decoration: none;
padding: ${rhythm(0.05)} ${rhythm(0.4)};
border-radius: ${rhythm(0.2)};
&:hover {
  text-decoration: none;
  cursor: pointer;
  background-color: #f1f1f1;
}
`
