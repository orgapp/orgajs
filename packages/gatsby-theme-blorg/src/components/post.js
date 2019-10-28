import React from 'react'
import Layout from './layout'
import Bio from './bio'
import Footer from './footer'

export default ({ title, body, location }) => {
  return (
    <Layout location={location}>
      <main>
        <h1>{ title }</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </main>
      <Footer>
        <hr css={ theme => ({
          backgroundColor: theme.color.muted,
          width: '100%' }) }/>
        <Bio/>
      </Footer>
    </Layout>
  )
}
