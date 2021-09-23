import React from 'react'
import { Link, PageProps } from 'gatsby'

type Page = {
  path: string
  context: {
    metadata: {
      title: string
    }
  }
}

const PageList: React.FC<PageProps & { pages: Page[] }> = ({ pages }) => {
  return (
    <>
      <ul>
        {pages.map((page, i) => (
          <li key={`page-${i}`}>
            <Link to={page.path}>
              {page.context.metadata.title || page.path}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export default PageList
