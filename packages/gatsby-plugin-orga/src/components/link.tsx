import React, { FC } from 'react'
import { isExternalLink } from '../tools'
import { Link } from 'gatsby'

interface Props extends Record<string, unknown> {
  href: string
}

const SmartLink: FC<Props> = ({ href, ...props }) => {
  if (isExternalLink(href)) {
    // @ts-ignore FIXME
    return <a href={href} {...props} />
  }

  // @ts-ignore FIXME
  return <Link to={href} {...props} />
}

export default SmartLink
