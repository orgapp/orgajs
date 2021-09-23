import React from 'react'
import { Link } from 'gatsby'

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

const SmartLink: React.FC<Props> = ({ href, ...props }) => {
  if (isExternalLink(href)) {
    return <a href={href} {...props} />
  }
  return <Link to={href} {...props} />
}

export default SmartLink
