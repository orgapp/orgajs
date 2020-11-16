import { graphql, StaticQuery } from 'gatsby'
import 'highlight.js/styles/solarized-light.css'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import 'semantic-ui-css/semantic.min.css'
import styled from 'styled-components'
import Header from './header'

const Container = styled.div`
margin: auto;
max-width: 740px;
`

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <Container>
        <Helmet
          title={data.site.siteMetadata.title}
          meta={[
            { name: 'description', content: 'Sample' },
            { name: 'keywords', content: 'sample, something' },
          ]}
        >
          <html lang="en" />
        </Helmet>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            padding: '0px 1.0875rem 1.45rem',
            paddingTop: 0,
          }}
        >
          {children}
        </div>
      </Container>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
