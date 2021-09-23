/* @jsx jsx */
import { Link } from 'gatsby'
import { FC } from 'react'
import { jsx } from 'theme-ui'

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
  a: SmartLink,
}

export default components
