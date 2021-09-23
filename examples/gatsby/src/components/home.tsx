import { PageProps } from 'gatsby'
import React, { FC } from 'react'
import Layout from './layout'
import PageList from './page-list'

const Home: FC<PageProps> = ({ data, children, ...props }) => {
  return (
    <Layout {...props}>
      <div>
        {children}
        <h1>Sitemap</h1>
        <PageList pages={data.pages.nodes} />
        <small style={{ color: 'gray' }}>
          the sitemap here is generated using data from inline graphql query
          from the org file
        </small>
      </div>
    </Layout>
  )
}

export default Home
