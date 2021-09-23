/* @jsx jsx */
import { jsx } from 'theme-ui'
import { FC } from 'react'
import { Link } from 'gatsby'

const FancyH1 = (props) => (
  <h1
    sx={{
      background: '-webkit-linear-gradient(#eee, #333)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}
    {...props}
  />
)

function isExternalLink(path: string): boolean {
  try {
    new URL(path)
    return true
  } catch {
    return false
  }
}

interface Props extends Record<string, unknown> {
  href: string
}

const SmartLink: FC<Props> = ({ href, ...props }) => {
  if (isExternalLink(href)) {
    return <a href={href} {...props} />
  }
  return <Link to={href} {...props} />
}

const components = {
  h1: FancyH1,
  a: SmartLink,
}

export default components
